/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import {
    useQueryMyCoursesSwr,
    useQueryMyInProgressChallengesSwr,
    useQueryMyLearnedLessonsSwr,
} from "@/hooks"
import { queryResolveRoute } from "@/modules/api/graphql/queries/query-resolve-route"
import { ContinueLearning } from "./index"

/**
 * What these tests guard - the difference between "you have not started anything yet" and
 * "you have not bought anything yet".
 *
 * They read identically from the resume request alone: no work in progress either way. Only the
 * course list separates them, which is why the block waits for it before choosing a sentence, and
 * why both sentences are asserted here.
 *
 * It also guards the merge: the same thing must not appear twice because it is both a lesson the
 * reader read and a challenge they started.
 */

const push = vi.fn()

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => "en",
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/hooks", () => ({
    useQueryMyLearnedLessonsSwr: vi.fn(),
    useQueryMyInProgressChallengesSwr: vi.fn(),
    useQueryMyCoursesSwr: vi.fn(),
}))
vi.mock("@/modules/api/graphql/queries/query-resolve-route", () => ({ queryResolveRoute: vi.fn() }))

/** One settled SWR answer, shaped the way the barrel hook returns it. */
const answer = (over: Partial<{ data: unknown, error: unknown }>) => ({
    data: undefined,
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
    ...over,
}) as never

/** One resumable reference as the server sends it. */
const ref = (globalId: string, label: string) => ({ globalId, label })

/** Wire all three requests of the block in one call. */
const wire = (
    lessons: Partial<{ data: unknown, error: unknown }>,
    challenges: Partial<{ data: unknown, error: unknown }>,
    courses: Partial<{ data: unknown, error: unknown }> = { data: [{ globalId: "c1" }] },
) => {
    vi.mocked(useQueryMyLearnedLessonsSwr).mockReturnValue(answer(lessons))
    vi.mocked(useQueryMyInProgressChallengesSwr).mockReturnValue(answer(challenges))
    vi.mocked(useQueryMyCoursesSwr).mockReturnValue(answer(courses))
}

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
})

describe("ContinueLearning", () => {
    it.each([
        ["the read history could not be loaded", { error: new Error("down") }, { data: [] }],
        ["the challenge progress could not be loaded", { data: [] }, { error: new Error("down") }],
    ])("says so and offers a way out when %s", (_why, lessons, challenges) => {
        wire(lessons, challenges)

        render(<ContinueLearning />)
        expect(screen.getByText("continueLearning.failed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "continueLearning.browse" }))
        expect(push).toHaveBeenCalledWith("/courses")
    })

    it.each([
        ["the read history", { data: undefined }, { data: [] }],
        ["the challenge progress", { data: [] }, { data: undefined }],
    ])("keeps three resting cards while %s is still on its way", (_which, lessons, challenges) => {
        wire(lessons, challenges)

        const { container } = render(<ContinueLearning />)
        expect(container.querySelectorAll("[data-node=\"resume-item-card\"]")).toHaveLength(3)
        expect(screen.queryByText("continueLearning.empty")).toBeNull()
    })

    it("waits for the course list rather than guessing which empty sentence is true", () => {
        wire({ data: [] }, { data: [] }, { data: undefined })

        const { container } = render(<ContinueLearning />)
        expect(container.querySelectorAll("[data-node=\"resume-item-card\"]")).toHaveLength(3)
        expect(screen.queryByText("continueLearning.onboarding")).toBeNull()
        expect(screen.queryByText("continueLearning.empty")).toBeNull()
    })

    it("welcomes a reader who owns no courses at all", () => {
        wire({ data: [] }, { data: [] }, { data: [] })

        render(<ContinueLearning />)
        expect(screen.getByText("continueLearning.onboarding")).toBeInTheDocument()
        expect(screen.queryByText("continueLearning.empty")).toBeNull()
    })

    it("tells an enrolled reader with nothing in flight that there is nothing to pick up", () => {
        wire({ data: [] }, { data: [] }, { data: [{ globalId: "c1" }] })

        render(<ContinueLearning />)
        expect(screen.getByText("continueLearning.empty")).toBeInTheDocument()
        expect(screen.queryByText("continueLearning.onboarding")).toBeNull()
    })

    it("settles on the plain empty sentence when the course list itself failed", () => {
        wire({ data: [] }, { data: [] }, { error: new Error("down") })

        render(<ContinueLearning />)
        expect(screen.getByText("continueLearning.empty")).toBeInTheDocument()
    })

    it("names content as content, keeps one challenge, and never shows more than three", () => {
        wire(
            { data: [ref("l1", "Ownership"), ref("l2", "Borrowing"), ref("l3", "Lifetimes"), ref("l4", "Traits")] },
            { data: [ref("h1", "Build a parser"), ref("h2", "Build a VM")] },
        )

        const { container } = render(<ContinueLearning />)
        expect(container.querySelectorAll("[data-node=\"resume-item-card\"]")).toHaveLength(3)
        expect(screen.getByText("Ownership")).toBeInTheDocument()
        expect(screen.getByText("Lifetimes")).toBeInTheDocument()
        expect(screen.queryByText("Traits")).toBeNull()
        expect(screen.queryByText("Build a parser")).toBeNull()
        expect(screen.getAllByText("continueLearning.kind.content")).toHaveLength(3)
    })

    it("shows a thing once when it is both read content and an unfinished challenge", () => {
        wire({ data: [ref("same", "Ownership")] }, { data: [ref("same", "Ownership")] })

        const { container } = render(<ContinueLearning />)
        expect(container.querySelectorAll("[data-node=\"resume-item-card\"]")).toHaveLength(1)
        expect(screen.getAllByText("Ownership")).toHaveLength(1)
        expect(screen.getByText("continueLearning.kind.content")).toBeInTheDocument()
    })

    it("resolves the item's route and travels there without doubling the locale", async () => {
        vi.mocked(queryResolveRoute).mockResolvedValue({
            data: { resolveRoute: { data: { path: "/en/contents/ownership" } } },
        } as never)
        wire({ data: [ref("l1", "Ownership")] }, { data: [] })

        render(<ContinueLearning />)
        fireEvent.click(screen.getByText("continueLearning.resume"))

        await waitFor(() => expect(push).toHaveBeenCalledWith("/contents/ownership"))
        expect(vi.mocked(queryResolveRoute)).toHaveBeenCalledWith({ request: { globalId: "l1" } })
    })

    it.each([
        ["answers with no route at all", { data: { resolveRoute: { data: null } } }],
        ["answers with nothing", {}],
    ])("stays put when the resolver %s", async (_why, resolved) => {
        vi.mocked(queryResolveRoute).mockResolvedValue(resolved as never)
        wire({ data: [ref("l1", "Ownership")] }, { data: [] })

        render(<ContinueLearning />)
        fireEvent.click(screen.getByText("continueLearning.resume"))

        await waitFor(() => expect(vi.mocked(queryResolveRoute)).toHaveBeenCalled())
        expect(push).not.toHaveBeenCalled()
    })
})
