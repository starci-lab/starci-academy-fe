/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useQueryMyUpcomingLivestreamsSwr, useQueryResolveRouteSwr } from "@/hooks"
import { UpcomingLivestreamCard } from "./index"

/**
 * What these tests guard - that the next three sessions are the next three, in order.
 *
 * The server is free to send them in any order and to send more than fit, so the ordering and the
 * cut are the block's own claim and are asserted against what a reader sees. The card also has to
 * disappear rather than draw an empty frame once there is nothing scheduled.
 */

const push = vi.fn()

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => "en",
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/hooks", () => ({
    useQueryMyUpcomingLivestreamsSwr: vi.fn(),
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

/** One upcoming session as the server sends it. */
const session = (courseGlobalId: string, nextStartAt: string, sessionTitle: string | null, courseTitle: string) =>
    ({ courseGlobalId, nextStartAt, sessionTitle, courseTitle })

/** Stand in for the on-demand route resolver, answering with one path. */
const resolver = (path: string | null) => ({
    trigger: vi.fn().mockResolvedValue({ data: { resolveRoute: { data: path === null ? null : { path } } } }),
}) as never

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
})

describe("UpcomingLivestreamCard", () => {
    it("offers the request again when the schedule could not be read", () => {
        const mutate = vi.fn()
        vi.mocked(useQueryMyUpcomingLivestreamsSwr).mockReturnValue(answer({ error: new Error("down"), mutate }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))

        render(<UpcomingLivestreamCard />)
        expect(screen.getByText("failed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "retry" }))
        expect(mutate).toHaveBeenCalledOnce()
    })

    it("keeps showing the sessions it already has when a refresh fails", () => {
        vi.mocked(useQueryMyUpcomingLivestreamsSwr).mockReturnValue(answer({
            error: new Error("stale"),
            data: [session("c1", "2026-09-01T10:00:00.000Z", "Kickoff", "Rust basics")],
        }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))

        render(<UpcomingLivestreamCard />)
        expect(screen.getByText("Kickoff")).toBeInTheDocument()
        expect(screen.queryByText("failed")).toBeNull()
    })

    it("holds three resting rows while the schedule is on its way", () => {
        vi.mocked(useQueryMyUpcomingLivestreamsSwr).mockReturnValue(answer({ data: undefined }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))

        const { container } = render(<UpcomingLivestreamCard />)
        expect(container.querySelectorAll("[data-node=\"upcoming-livestream-row\"]")).toHaveLength(3)
        expect(screen.getByText("heading")).toBeInTheDocument()
    })

    it("draws no card at all when nothing is scheduled", () => {
        vi.mocked(useQueryMyUpcomingLivestreamsSwr).mockReturnValue(answer({ data: [] }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))

        const { container } = render(<UpcomingLivestreamCard />)
        expect(container).toBeEmptyDOMElement()
    })

    it("shows the three soonest sessions in time order, whatever order they arrived in", () => {
        vi.mocked(useQueryMyUpcomingLivestreamsSwr).mockReturnValue(answer({
            data: [
                session("c3", "2026-09-03T10:00:00.000Z", "Third", "Rust basics"),
                session("c1", "2026-09-01T10:00:00.000Z", "First", "Rust basics"),
                session("c4", "2026-09-04T10:00:00.000Z", "Fourth", "Rust basics"),
                session("c2", "2026-09-02T10:00:00.000Z", "Second", "Rust basics"),
            ],
        }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))

        const { container } = render(<UpcomingLivestreamCard />)
        const rows = container.querySelectorAll("[data-node=\"upcoming-livestream-row\"]")
        expect(rows).toHaveLength(3)
        expect(Array.from(rows, (row) => row.querySelector("[data-weight=\"semibold\"]")?.textContent))
            .toEqual(["First", "Second", "Third"])
        expect(screen.queryByText("Fourth")).toBeNull()
    })

    it("falls back to the course name when the session has none, and drops the second line with it", () => {
        vi.mocked(useQueryMyUpcomingLivestreamsSwr).mockReturnValue(answer({
            data: [
                session("c1", "2026-09-01T10:00:00.000Z", null, "Rust basics"),
                session("c2", "2026-09-02T10:00:00.000Z", "Ownership deep dive", "Rust advanced"),
            ],
        }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(resolver("/x"))

        render(<UpcomingLivestreamCard />)
        expect(screen.getByText("Rust basics")).toBeInTheDocument()
        expect(screen.getByText("Ownership deep dive")).toBeInTheDocument()
        // Only the named session repeats its course underneath; the unnamed one would say it twice.
        expect(screen.getByText("Rust advanced")).toBeInTheDocument()
        expect(screen.getAllByText("Rust basics")).toHaveLength(1)
    })

    it("resolves the course route, strips the locale the router adds back, and travels there", async () => {
        const route = resolver("/en/courses/rust")
        vi.mocked(useQueryMyUpcomingLivestreamsSwr).mockReturnValue(answer({
            data: [session("c1", "2026-09-01T10:00:00.000Z", "Kickoff", "Rust basics")],
        }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(route)

        render(<UpcomingLivestreamCard />)
        fireEvent.click(screen.getByRole("button", { name: "Kickoff" }))

        await waitFor(() => expect(push).toHaveBeenCalledWith("/courses/rust"))
        expect((route as unknown as { trigger: ReturnType<typeof vi.fn> }).trigger)
            .toHaveBeenCalledWith({ globalId: "c1" })
        // The row is pressable again once the resolution settles.
        await waitFor(() => expect(screen.getByRole("button", { name: "Kickoff" })).not.toBeDisabled())
    })

    it("stays put when the resolver has no route for the course", async () => {
        const route = resolver(null)
        vi.mocked(useQueryMyUpcomingLivestreamsSwr).mockReturnValue(answer({
            data: [session("c1", "2026-09-01T10:00:00.000Z", "Kickoff", "Rust basics")],
        }))
        vi.mocked(useQueryResolveRouteSwr).mockReturnValue(route)

        render(<UpcomingLivestreamCard />)
        fireEvent.click(screen.getByRole("button", { name: "Kickoff" }))

        await waitFor(() => expect((route as unknown as { trigger: ReturnType<typeof vi.fn> }).trigger).toHaveBeenCalled())
        expect(push).not.toHaveBeenCalled()
    })
})
