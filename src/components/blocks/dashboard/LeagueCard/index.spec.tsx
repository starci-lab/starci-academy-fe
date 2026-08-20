/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { useQueryMeSwr, useQueryMyLeagueSwr } from "@/hooks"
import { LeagueCard } from "./index"

/**
 * What these tests guard - that the percentile is measured against the cohort it names.
 *
 * "Top 20%" is a claim about a denominator, and the only honest denominator here is the number of
 * people in the reader's own league. It is asserted from the sentence a reader sees, together with
 * the three movement verdicts, which are not interchangeable: climbing, falling, and having no
 * baseline at all must not collapse into one caret.
 */

const push = vi.fn()

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) =>
        values === undefined ? key : `${key}:${Object.values(values).join(",")}`,
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/hooks", () => ({
    useQueryMyLeagueSwr: vi.fn(),
    useQueryMeSwr: vi.fn(),
}))

/** The instant the week's countdown is measured against. */
const NOW = new Date("2026-09-10T12:00:00.000Z")

/** One settled SWR answer, shaped the way the barrel hook returns it. */
const answer = (over: Partial<{ data: unknown, error: unknown, mutate: () => void }>) => ({
    data: undefined,
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
    ...over,
}) as never

/** One weekly-league entry as the server sends it. */
const entry = (over: Partial<Record<string, unknown>> = {}) => ({
    userGlobalId: "u1",
    username: "ada",
    avatar: null,
    weekPoints: 120,
    rank: 1,
    rankDelta: null,
    ...over,
})

/** Wire the league and the viewer in one call. */
const wire = (
    league: Partial<{ data: unknown, error: unknown, mutate: () => void }>,
    me: Partial<{ data: unknown }> = { data: { username: "learner" } },
) => {
    vi.mocked(useQueryMyLeagueSwr).mockReturnValue(answer(league))
    vi.mocked(useQueryMeSwr).mockReturnValue(answer(me))
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

describe("LeagueCard", () => {
    it("offers the request again when the league could not be read", () => {
        const mutate = vi.fn()
        wire({ error: new Error("down"), mutate })

        render(<LeagueCard />)
        expect(screen.getByText("league.failed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "retry" }))
        expect(mutate).toHaveBeenCalledOnce()
    })

    it("holds five resting ranks while the league is on its way", () => {
        wire({ data: undefined })

        const { container } = render(<LeagueCard />)
        expect(container.querySelectorAll("[data-node^=\"ranked-user-row\"]")).toHaveLength(5)
        expect(screen.queryByText("league.empty")).toBeNull()
    })

    it.each([
        ["the server answered with nothing at all", null],
        ["nobody is in the league yet", { entries: [], weekEndAt: "2026-09-13T00:00:00.000Z" }],
    ])("says the league is bare when %s", (_why, data) => {
        wire({ data })

        const { container } = render(<LeagueCard />)
        expect(screen.getByText("league.empty")).toBeInTheDocument()
        expect(container.querySelectorAll("[data-node^=\"ranked-user-row\"]")).toHaveLength(0)
    })

    it("measures the reader's percentile against the cohort and counts the week down beside it", () => {
        wire({
            data: {
                weekEndAt: "2026-09-12T15:00:00.000Z",
                entries: [
                    ...Array.from({ length: 9 }, (_unused, index) => entry({
                        userGlobalId: `u${index}`,
                        username: `rival-${index}`,
                        rank: index + 1,
                    })),
                    entry({ userGlobalId: "self", username: "learner", rank: 10, weekPoints: 30 }),
                ],
            },
        })

        render(<LeagueCard />)
        // Rank 10 of a cohort of 10 is the hundredth percentile, not "top 1".
        expect(screen.getByText("league.rankLine:10,100")).toBeInTheDocument()
        expect(screen.getByText("points:30 · resetIn:2,3")).toBeInTheDocument()
    })

    it("appends the reader below the cut when they are outside the top five", () => {
        wire({
            data: {
                weekEndAt: "2026-09-12T15:00:00.000Z",
                entries: [
                    ...Array.from({ length: 6 }, (_unused, index) => entry({
                        userGlobalId: `u${index}`,
                        username: `rival-${index}`,
                        rank: index + 1,
                    })),
                    entry({ userGlobalId: "self", username: "learner", rank: 7, weekPoints: 30 }),
                ],
            },
        })

        const { container } = render(<LeagueCard />)
        expect(container.querySelectorAll("[data-node^=\"ranked-user-row\"]")).toHaveLength(6)
        expect(screen.getByText("learner · you")).toBeInTheDocument()
        expect(screen.queryByText("rival-5")).toBeNull()
    })

    it("appends nothing extra when the reader is already inside the cut", () => {
        wire({
            data: {
                weekEndAt: "2026-09-12T15:00:00.000Z",
                entries: [
                    entry({ userGlobalId: "self", username: "learner", rank: 1 }),
                    entry({ userGlobalId: "u2", username: "ada", rank: 2 }),
                ],
            },
        })

        const { container } = render(<LeagueCard />)
        expect(container.querySelectorAll("[data-node^=\"ranked-user-row\"]")).toHaveLength(2)
    })

    it("tells climbing, falling and no-baseline apart", () => {
        wire({
            data: {
                weekEndAt: "2026-09-12T15:00:00.000Z",
                entries: [
                    entry({ userGlobalId: "u1", username: "ada", rank: 1, rankDelta: 3 }),
                    entry({ userGlobalId: "u2", username: "grace", rank: 2, rankDelta: -2 }),
                    entry({ userGlobalId: "u3", username: "alan", rank: 3, rankDelta: 0 }),
                    entry({ userGlobalId: "u4", username: null, rank: 4, rankDelta: null }),
                ],
            },
        })

        const { container } = render(<LeagueCard />)
        expect(container.querySelectorAll("[data-node=\"ranked-user-row-success-verdict\"]")).toHaveLength(1)
        expect(container.querySelectorAll("[data-node=\"ranked-user-row-danger-verdict\"]")).toHaveLength(1)
        expect(container.querySelectorAll("[data-node=\"ranked-user-row\"]")).toHaveLength(2)
        expect(screen.getByLabelText("up:3")).toBeInTheDocument()
        expect(screen.getByLabelText("down:2")).toBeInTheDocument()
        expect(screen.getAllByLabelText("noMovement")).toHaveLength(2)
        expect(screen.getByText("anonymous")).toBeInTheDocument()
    })

    it("says the reader is unplaced when they are not in the league they are looking at", () => {
        wire({
            data: {
                weekEndAt: "2026-09-12T15:00:00.000Z",
                entries: [entry({ userGlobalId: "u1", username: "ada", rank: 1 })],
            },
        })

        render(<LeagueCard />)
        expect(screen.getByText("league.unplaced")).toBeInTheDocument()
        expect(screen.getAllByText("league.empty")).toHaveLength(1)
    })

    it("floors an already-finished week at zero instead of counting backwards", () => {
        wire({
            data: {
                weekEndAt: "2026-09-01T00:00:00.000Z",
                entries: [entry({ userGlobalId: "self", username: "learner", rank: 1, weekPoints: 30 })],
            },
        })

        render(<LeagueCard />)
        expect(screen.getByText("points:30 · resetIn:0,0")).toBeInTheDocument()
    })

    it("opens a rival's profile, leaves the reader's own row inert, and sends nobody to a nameless one", () => {
        wire({
            data: {
                weekEndAt: "2026-09-12T15:00:00.000Z",
                entries: [
                    entry({ userGlobalId: "u1", username: "ada", rank: 1 }),
                    entry({ userGlobalId: "u2", username: null, rank: 2 }),
                    entry({ userGlobalId: "self", username: "learner", rank: 3 }),
                ],
            },
        })

        render(<LeagueCard />)
        fireEvent.click(screen.getByText("anonymous"))
        expect(push).not.toHaveBeenCalled()

        fireEvent.click(screen.getByText("learner · you"))
        expect(push).not.toHaveBeenCalled()

        fireEvent.click(screen.getByText("ada"))
        expect(push).toHaveBeenCalledWith("/profile/ada")
    })

    it("sends the reader to the full board", () => {
        wire({
            data: {
                weekEndAt: "2026-09-12T15:00:00.000Z",
                entries: [entry({ userGlobalId: "u1", username: "ada", rank: 1 })],
            },
        })

        render(<LeagueCard />)
        fireEvent.click(screen.getByText("seeMore"))
        expect(push).toHaveBeenCalledWith("/league")
    })
})
