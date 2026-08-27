/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useMutateSetFollowSwr, useQueryResolveRouteSwr, useQuerySuggestedUsersSwr } from "@/hooks"
import { WhoToFollow } from "./index"

/**
 * What these tests guard - that a follow is only claimed once the server agrees.
 *
 * The block turns the button the instant it is pressed, which is the right thing to draw and the
 * wrong thing to keep if the request comes back refused. Both outcomes are asserted through the
 * label a reader sees, not through the mutation call.
 *
 * The three ways of having nobody to suggest - a failed request, an explicit null, and a settled
 * empty list - all have to leave the rail absent rather than draw an empty card.
 */

const push = vi.fn()

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/hooks", () => ({
    useQuerySuggestedUsersSwr: vi.fn(),
    useQueryResolveRouteSwr: vi.fn(),
    useMutateSetFollowSwr: vi.fn(),
}))

/** One settled SWR answer, shaped the way the barrel hook returns it. */
const answer = (over: Partial<{ data: unknown, error: unknown }>) => ({
    data: undefined,
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
    ...over,
}) as never

/** One suggested identity as the server sends it. */
const suggestion = (over: Partial<Record<string, unknown>> = {}) => ({
    globalId: "gid-1",
    username: "ada",
    displayName: "Ada Lovelace",
    avatar: "https://cdn.test/ada.png",
    openToWork: false,
    ...over,
})

/** Stand in for the on-demand route resolver, answering with one path. */
const resolver = (path: string | null) => ({
    trigger: vi.fn().mockResolvedValue({ data: { resolveRoute: { data: path === null ? null : { path } } } }),
}) as never

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
})

describe("WhoToFollow", () => {
    it.each([
        ["the request failed", { error: new Error("down") }],
        ["the server answered with nothing at all", { data: null }],
        ["there is nobody left to suggest", { data: [] }],
    ])("draws no rail when %s", (_why, over) => {
        vi.mocked(useQuerySuggestedUsersSwr).mockReturnValue(answer(over))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))
        vi.mocked(useMutateSetFollowSwr).mockReturnValue({ trigger: vi.fn() } as never)

        const { container } = render(<WhoToFollow />)
        expect(container).toBeEmptyDOMElement()
    })

    it("holds four resting rows while the suggestions are on their way", () => {
        vi.mocked(useQuerySuggestedUsersSwr).mockReturnValue(answer({ data: undefined }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))
        vi.mocked(useMutateSetFollowSwr).mockReturnValue({ trigger: vi.fn() } as never)

        render(<WhoToFollow />)
        expect(screen.getByText("whoToFollow")).toBeInTheDocument()
        expect(screen.getByText("whoToFollow")).toBeInTheDocument()
    })

    it("shows at most four people, falls back to the handle for a nameless one, and badges only the open-to-work", () => {
        vi.mocked(useQuerySuggestedUsersSwr).mockReturnValue(answer({
            data: [
                suggestion({ globalId: "g1", username: "ada", displayName: "Ada Lovelace", openToWork: true }),
                suggestion({ globalId: "g2", username: "grace", displayName: null, avatar: null }),
                suggestion({ globalId: "g3", username: "alan", displayName: "Alan Turing" }),
                suggestion({ globalId: "g4", username: "edsger", displayName: "Edsger Dijkstra" }),
                suggestion({ globalId: "g5", username: "barbara", displayName: "Barbara Liskov" }),
            ],
        }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))
        vi.mocked(useMutateSetFollowSwr).mockReturnValue({ trigger: vi.fn() } as never)

        render(<WhoToFollow />)
        expect(screen.getByText("Ada Lovelace")).toBeInTheDocument()
        expect(screen.getByText("Ada Lovelace")).toBeInTheDocument()
        // No display name, so the handle itself becomes the name and appears on both lines.
        expect(screen.getByText("grace")).toBeInTheDocument()
        expect(screen.getByText("@grace")).toBeInTheDocument()
        expect(screen.queryByText("@barbara")).toBeNull()
        expect(screen.getAllByText("openToWork")).toHaveLength(1)
    })

    it("resolves a person's own route and travels there", async () => {
        const route = resolver("/profile/ada")
        vi.mocked(useQuerySuggestedUsersSwr).mockReturnValue(answer({ data: [suggestion()] }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(route)
        vi.mocked(useMutateSetFollowSwr).mockReturnValue({ trigger: vi.fn() } as never)

        render(<WhoToFollow />)
        fireEvent.click(screen.getByText("Ada Lovelace"))

        await waitFor(() => expect(push).toHaveBeenCalledWith("/profile/ada"))
    })

    it("stays put when the resolver has no route for the person", async () => {
        const route = resolver(null)
        vi.mocked(useQuerySuggestedUsersSwr).mockReturnValue(answer({ data: [suggestion()] }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(route)
        vi.mocked(useMutateSetFollowSwr).mockReturnValue({ trigger: vi.fn() } as never)

        render(<WhoToFollow />)
        fireEvent.click(screen.getByText("Ada Lovelace"))

        await waitFor(() => expect((route as unknown as { trigger: ReturnType<typeof vi.fn> }).trigger).toHaveBeenCalled())
        expect(push).not.toHaveBeenCalled()
    })

    it("keeps the followed state once the server agrees, and stops offering the action", async () => {
        const trigger = vi.fn().mockResolvedValue({ data: { setFollow: { success: true } } })
        vi.mocked(useQuerySuggestedUsersSwr).mockReturnValue(answer({ data: [suggestion()] }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))
        vi.mocked(useMutateSetFollowSwr).mockReturnValue({ trigger } as never)

        render(<WhoToFollow />)
        fireEvent.click(screen.getByRole("button", { name: "follow" }))

        await waitFor(() => expect(screen.getByRole("button", { name: "followingState" })).toBeInTheDocument())
        expect(trigger).toHaveBeenCalledWith({ userId: "gid-1", follow: true })
        expect(screen.queryByRole("button", { name: "follow" })).toBeNull()
    })

    it("puts the button back when the server refuses the follow", async () => {
        const trigger = vi.fn().mockResolvedValue({ data: { setFollow: { success: false } } })
        vi.mocked(useQuerySuggestedUsersSwr).mockReturnValue(answer({ data: [suggestion()] }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))
        vi.mocked(useMutateSetFollowSwr).mockReturnValue({ trigger } as never)

        render(<WhoToFollow />)
        fireEvent.click(screen.getByRole("button", { name: "follow" }))

        await waitFor(() => expect(trigger).toHaveBeenCalled())
        await waitFor(() => expect(screen.getByRole("button", { name: "follow" })).toBeInTheDocument())
        expect(screen.queryByRole("button", { name: "followingState" })).toBeNull()
    })

    it("puts the button back when the follow request throws", async () => {
        const trigger = vi.fn().mockRejectedValue(new Error("offline"))
        const swallow = () => undefined
        process.on("unhandledRejection", swallow)
        vi.mocked(useQuerySuggestedUsersSwr).mockReturnValue(answer({ data: [suggestion()] }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))
        vi.mocked(useMutateSetFollowSwr).mockReturnValue({ trigger } as never)

        render(<WhoToFollow />)
        fireEvent.click(screen.getByRole("button", { name: "follow" }))

        await waitFor(() => expect(trigger).toHaveBeenCalled())
        await waitFor(() => expect(screen.getByRole("button", { name: "follow" })).toBeInTheDocument())
        process.off("unhandledRejection", swallow)
    })
})
