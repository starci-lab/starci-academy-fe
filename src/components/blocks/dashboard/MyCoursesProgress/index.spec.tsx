/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useQueryMyCoursesSwr, useQueryResolveRouteSwr } from "@/hooks"
import { MyCoursesProgress } from "./index"

/**
 * What these tests guard - that a course with nothing counted yet reads as 0, not as NaN.
 *
 * Every dimension of the payload is nullable and the completion figure arrives already computed
 * upstream, so a missing count and a non-finite percentage are both things the server can send.
 * Each is asserted from the figure a reader sees rather than from the row object.
 */

const push = vi.fn()

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => "en",
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/hooks", () => ({
    useQueryMyCoursesSwr: vi.fn(),
    useQueryResolveRouteSwr: vi.fn(),
}))

/** One settled SWR answer, shaped the way the barrel hook returns it. */
const answer = (over: Partial<{ data: unknown, error: unknown, mutate: () => void }>) => ({
    data: undefined,
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
    ...over,
}) as never

/** One enrolled-course payload as the server sends it. */
const enrolled = (over: Partial<Record<string, unknown>> = {}) => ({
    globalId: "course-1",
    label: "Rust basics",
    thumbnailUrl: "https://cdn.test/rust.png",
    contentCompleted: 4,
    contentTotal: 8,
    challengeCompleted: 1,
    challengeTotal: 2,
    completed: 1,
    total: 4,
    completionPercent: 45.4,
    isEnrolled: true,
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

describe("MyCoursesProgress", () => {
    it("offers the request again when the courses could not be read", () => {
        const mutate = vi.fn()
        vi.mocked(useQueryMyCoursesSwr).mockReturnValue(answer({ error: new Error("down"), mutate }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))

        render(<MyCoursesProgress />)
        expect(screen.getByText("failed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "retry" }))
        expect(mutate).toHaveBeenCalledOnce()
    })

    it("keeps showing the courses it already has when a refresh fails", () => {
        vi.mocked(useQueryMyCoursesSwr).mockReturnValue(answer({ error: new Error("stale"), data: [enrolled()] }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))

        render(<MyCoursesProgress />)
        expect(screen.getByText("Rust basics")).toBeInTheDocument()
        expect(screen.queryByText("failed")).toBeNull()
    })

    it("holds two resting rows while the courses are on their way", () => {
        vi.mocked(useQueryMyCoursesSwr).mockReturnValue(answer({ data: undefined }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))

        const { container } = render(<MyCoursesProgress />)
        expect(container.querySelectorAll("[data-loading=\"true\"]").length).toBeGreaterThan(0)
        expect(screen.getByText("heading")).toBeInTheDocument()
    })

    it("says the shelf is bare, and still offers the request again, when nothing is enrolled", () => {
        const mutate = vi.fn()
        vi.mocked(useQueryMyCoursesSwr).mockReturnValue(answer({ data: [], mutate }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))

        render(<MyCoursesProgress />)
        expect(screen.getByText("empty")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "retry" }))
        expect(mutate).toHaveBeenCalledOnce()
    })

    it("rounds the overall figure and counts each dimension separately", () => {
        vi.mocked(useQueryMyCoursesSwr).mockReturnValue(answer({ data: [enrolled()] }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))

        render(<MyCoursesProgress />)
        expect(screen.getByText("45%")).toBeInTheDocument()
        expect(screen.getByText("progress.content · 4/8")).toBeInTheDocument()
        expect(screen.getByText("progress.challenge · 1/2")).toBeInTheDocument()
        expect(screen.getByText("progress.milestone · 1/4")).toBeInTheDocument()
        expect(screen.queryByText("trial")).toBeNull()
    })

    it("reads every missing count as nothing done and every empty dimension as zero", () => {
        vi.mocked(useQueryMyCoursesSwr).mockReturnValue(answer({
            data: [enrolled({
                contentCompleted: null,
                contentTotal: null,
                challengeCompleted: null,
                challengeTotal: null,
                completed: null,
                total: null,
                thumbnailUrl: null,
                completionPercent: Number.NaN,
            })],
        }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))

        const { container } = render(<MyCoursesProgress />)
        expect(screen.getByText("0%")).toBeInTheDocument()
        expect(screen.getByText("progress.content · 0/0")).toBeInTheDocument()
        expect(container.querySelector("img")).toBeNull()
    })

    it("clamps a percentage the server sent past its own ceiling", () => {
        vi.mocked(useQueryMyCoursesSwr).mockReturnValue(answer({
            data: [enrolled({ completionPercent: 140, contentCompleted: 9, contentTotal: 8 })],
        }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))

        render(<MyCoursesProgress />)
        expect(screen.getByText("100%")).toBeInTheDocument()
        expect(screen.getByText("progress.content · 9/8")).toBeInTheDocument()
    })

    it("marks a course the reader is only trying", () => {
        vi.mocked(useQueryMyCoursesSwr).mockReturnValue(answer({ data: [enrolled({ isEnrolled: false })] }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))

        render(<MyCoursesProgress />)
        expect(screen.getByText("trial")).toBeInTheDocument()
    })

    it("shuts the row while its route is resolving, then travels there without doubling the locale", async () => {
        const route = resolver("/en/courses/rust")
        vi.mocked(useQueryMyCoursesSwr).mockReturnValue(answer({ data: [enrolled()] }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(route)

        render(<MyCoursesProgress />)
        fireEvent.click(screen.getByRole("button", { name: "Rust basics" }))

        await waitFor(() => expect(push).toHaveBeenCalledWith("/courses/rust"))
        expect((route as unknown as { trigger: ReturnType<typeof vi.fn> }).trigger)
            .toHaveBeenCalledWith({ globalId: "course-1" })
        await waitFor(() => expect(screen.getByRole("button", { name: "Rust basics" })).not.toBeDisabled())
    })

    it("stays put, and re-opens the row, when the resolver has no route for the course", async () => {
        const route = resolver(null)
        vi.mocked(useQueryMyCoursesSwr).mockReturnValue(answer({ data: [enrolled()] }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(route)

        render(<MyCoursesProgress />)
        fireEvent.click(screen.getByRole("button", { name: "Rust basics" }))

        await waitFor(() => expect((route as unknown as { trigger: ReturnType<typeof vi.fn> }).trigger).toHaveBeenCalled())
        expect(push).not.toHaveBeenCalled()
        await waitFor(() => expect(screen.getByRole("button", { name: "Rust basics" })).not.toBeDisabled())
    })
})
