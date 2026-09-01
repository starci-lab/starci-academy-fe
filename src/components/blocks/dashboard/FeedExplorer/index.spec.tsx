/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import {
    useMutateReactActivitySwr,
    useQueryMyFeedSwr,
    useQueryResolveRouteSwr,
} from "@/hooks"
import { ActivityType, MyFeedCategory, MyFeedTab, type QueryMyFeedItemData } from "@/modules/api/graphql/queries/types/my-feed"
import { ReactionType } from "@/modules/api/graphql/queries/types/reactions"
import { FeedExplorer } from "./index"

/**
 * What these tests guard - that "nothing here" always says WHY, and offers the matching way out.
 *
 * An empty feed under a category filter and an empty feed on a brand-new platform look identical
 * and need opposite offers: one clears the filter, the other sends the reader to the catalogue.
 * Choosing wrong strands the reader, so each is asserted by pressing the offer and checking what
 * actually happened.
 *
 * It also guards the second page, which has a failure of its own: rows already on screen must
 * survive a failed "load more" rather than being replaced by a whole-feed error.
 */

const push = vi.fn()

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) =>
        values === undefined ? key : `${key}:${Object.values(values).join(",")}`,
    useLocale: () => "en-US",
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/hooks", () => ({
    useQueryMyFeedSwr: vi.fn(),
    useMutateReactActivitySwr: vi.fn(),
    useQueryResolveRouteSwr: vi.fn(),
}))

/** Local noon, so the relative times in the feed stay inside one local day. */
const NOW = new Date(2026, 8, 10, 12, 0, 0)

/** One feed row as the server sends it. */
const item = (over: Partial<QueryMyFeedItemData> = {}): QueryMyFeedItemData => ({
    id: "a1",
    actorGlobalId: "actor-1",
    actorUsername: "ada",
    actorAvatar: null,
    type: ActivityType.ChallengePassed,
    targetGlobalId: "target-1",
    targetLabel: "Build a parser",
    at: new Date(NOW.getTime() - 30 * 60_000).toISOString(),
    reactionCount: 0,
    myReaction: null,
    isMine: false,
    ...over,
})

/** One settled answer of the paged feed hook. */
const feed = (over: Partial<Record<string, unknown>> = {}) => ({
    data: undefined,
    error: undefined,
    isValidating: false,
    size: 1,
    setSize: vi.fn(),
    mutate: vi.fn(),
    ...over,
}) as never

/** Stand in for the on-demand route resolver, answering with one path. */
const resolver = (path: string | null) => ({
    trigger: vi.fn().mockResolvedValue({ data: { resolveRoute: { data: path === null ? null : { path } } } }),
}) as never

/** Wire the Bulletin destination around one settled feed answer. */
const wire = (query: unknown, over: { route?: unknown, reaction?: unknown } = {}) => {
    vi.mocked(useQueryMyFeedSwr).mockReturnValue(query as never)
    vi.mocked(useQueryResolveRouteSwr).mockReturnValue((over.route ?? resolver("/x")) as never)
    vi.mocked(useMutateReactActivitySwr).mockReturnValue((over.reaction ?? { trigger: vi.fn() }) as never)
}

beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(NOW)
})

afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.clearAllMocks()
})

describe("FeedExplorer", () => {
    it("rests the feed, and offers no second page, while the first one is on its way", () => {
        wire(feed({ data: undefined }))

        const { container } = render(<FeedExplorer />)
        expect(container.querySelectorAll("section[data-grammar-surface-card='true']")).toHaveLength(1)
        expect(useQueryMyFeedSwr).toHaveBeenCalledWith(MyFeedTab.ForYou, MyFeedCategory.All)
        expect(screen.queryByRole("button", { name: "loadMore" })).toBeNull()
        expect(screen.queryByText("feedFailed")).toBeNull()
    })

    it("says the whole feed failed and re-asks for it", () => {
        const mutate = vi.fn()
        wire(feed({ error: new Error("down"), data: undefined, mutate }))

        render(<FeedExplorer />)
        expect(screen.getByText("feedFailed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "retry" }))
        expect(mutate).toHaveBeenCalledOnce()
    })

    it("sends a reader with an empty platform to the catalogue", () => {
        wire(feed({ data: [{ items: [], nextCursor: null }] }))

        render(<FeedExplorer />)
        expect(screen.getByText("feedEmptyPlatform")).toBeInTheDocument()
        expect(screen.getByText("feedEmptyPlatformDescription")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "browseCourses" }))
        expect(push).toHaveBeenCalledWith("/courses")
    })

    it("asks for the next page only while there is one", () => {
        const setSize = vi.fn()
        wire(feed({ data: [{ items: [item()], nextCursor: "cursor-2" }], size: 1, setSize }))

        render(<FeedExplorer />)
        fireEvent.click(screen.getByRole("button", { name: "loadMore" }))
        expect(setSize).toHaveBeenCalledWith(2)
    })

    it("offers nothing more to load once the last page has landed", () => {
        wire(feed({ data: [{ items: [item()], nextCursor: null }] }))

        render(<FeedExplorer />)
        expect(screen.queryByRole("button", { name: "loadMore" })).toBeNull()
        expect(screen.getByText("ada")).toBeInTheDocument()
    })

    it("marks the control as working while the next page is in flight", () => {
        wire(feed({ data: [{ items: [item()], nextCursor: "cursor-2" }], isValidating: true }))

        render(<FeedExplorer />)
        const control = screen.getByRole("button", { name: "loadMore" })
        expect(control).toHaveAttribute("data-action-pending", "true")
        expect(control).toBeDisabled()
    })

    it("keeps the rows it has when the next page fails, and retries just that page", () => {
        const mutate = vi.fn()
        wire(feed({
            data: [{ items: [item()], nextCursor: "cursor-2" }],
            error: new Error("page down"),
            mutate,
        }))

        render(<FeedExplorer />)
        expect(screen.getByText("ada")).toBeInTheDocument()
        expect(screen.queryByText("feedFailed")).toBeNull()
        expect(screen.getByText("loadMoreFailed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "retry" }))
        expect(mutate).toHaveBeenCalledOnce()
    })

    it("joins every page it has already read into one stream", () => {
        wire(feed({
            data: [
                { items: [item({ id: "a1", actorUsername: "ada" })], nextCursor: "cursor-2" },
                { items: [item({ id: "a2", actorUsername: "grace", actorGlobalId: "actor-2" })], nextCursor: null },
            ],
        }))

        render(<FeedExplorer />)
        expect(screen.getByText("ada")).toBeInTheDocument()
        expect(screen.getByText("grace")).toBeInTheDocument()
        // The cursor of the LAST page decides whether there is more, not the first.
        expect(screen.queryByRole("button", { name: "loadMore" })).toBeNull()
    })

    it("resolves an actor's route and travels there", async () => {
        const route = resolver("/profile/ada")
        wire(feed({ data: [{ items: [item()], nextCursor: null }] }), { route })

        render(<FeedExplorer />)
        fireEvent.click(screen.getByText("ada"))

        await waitFor(() => expect(push).toHaveBeenCalledWith("/profile/ada"))
        expect((route as unknown as { trigger: ReturnType<typeof vi.fn> }).trigger)
            .toHaveBeenCalledWith({ globalId: "actor-1" })
    })

    it("stays put when the resolver has no route for the actor", async () => {
        const route = resolver(null)
        wire(feed({ data: [{ items: [item()], nextCursor: null }] }), { route })

        render(<FeedExplorer />)
        fireEvent.click(screen.getByText("ada"))

        await waitFor(() => expect((route as unknown as { trigger: ReturnType<typeof vi.fn> }).trigger).toHaveBeenCalled())
        expect(push).not.toHaveBeenCalled()
    })

    it("resolves the target's own route, which is a different destination from the actor's", async () => {
        const route = resolver("/challenges/parser")
        wire(feed({ data: [{ items: [item()], nextCursor: null }] }), { route })

        render(<FeedExplorer />)
        fireEvent.click(screen.getByText("Build a parser"))

        await waitFor(() => expect(push).toHaveBeenCalledWith("/challenges/parser"))
        expect((route as unknown as { trigger: ReturnType<typeof vi.fn> }).trigger)
            .toHaveBeenCalledWith({ globalId: "target-1" })
    })

    it("stays put when the resolver has no route for the target", async () => {
        const route = resolver(null)
        wire(feed({ data: [{ items: [item()], nextCursor: null }] }), { route })

        render(<FeedExplorer />)
        fireEvent.click(screen.getByText("Build a parser"))

        await waitFor(() => expect((route as unknown as { trigger: ReturnType<typeof vi.fn> }).trigger).toHaveBeenCalled())
        expect(push).not.toHaveBeenCalled()
    })

    it("draws no target link at all when the activity points at nothing", () => {
        wire(feed({ data: [{ items: [item({ targetGlobalId: null, targetLabel: null })], nextCursor: null }] }))

        render(<FeedExplorer />)
        expect(screen.getByText("ada")).toBeInTheDocument()
        expect(screen.queryByText("Build a parser")).toBeNull()
    })

    it("records a reaction and re-reads the feed so the count is the server's", async () => {
        const trigger = vi.fn().mockResolvedValue({})
        const mutate = vi.fn()
        wire(
            feed({ data: [{ items: [item()], nextCursor: null }], mutate }),
            { reaction: { trigger } },
        )

        render(<FeedExplorer />)
        fireEvent.click(screen.getByRole("button", { name: "react" }))
        fireEvent.click(await screen.findByRole("button", { name: "reactions.love" }))

        await waitFor(() => expect(trigger).toHaveBeenCalledWith({ activityId: "a1", type: ReactionType.Love }))
        await waitFor(() => expect(mutate).toHaveBeenCalledOnce())
    })

    it("takes a reaction back by pressing the one already chosen", async () => {
        const trigger = vi.fn().mockResolvedValue({})
        wire(
            feed({ data: [{ items: [item({ myReaction: ReactionType.Love, reactionCount: 1 })], nextCursor: null }] }),
            { reaction: { trigger } },
        )

        render(<FeedExplorer />)
        fireEvent.click(screen.getByRole("button", { name: "react" }))
        fireEvent.click(await screen.findByRole("button", { name: "reactions.love" }))

        await waitFor(() => expect(trigger).toHaveBeenCalledWith({ activityId: "a1", type: null }))
    })
})
