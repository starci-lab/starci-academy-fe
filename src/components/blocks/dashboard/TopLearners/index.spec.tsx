/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { useMutateSetFollowSwr, useQueryGlobalLeaderboardSwr, useQueryMeSwr } from "@/hooks"
import { TopLearners } from "./index"

/**
 * What these tests guard - that the reader always finds themselves on the board.
 *
 * The card is a five-row preview of a leaderboard the reader is usually not in the top five of, so
 * the block appends their own standing when the cut leaves them out and must NOT append a second
 * copy when it does not. Both are asserted by counting the rows a reader sees.
 *
 * It also guards the two rows that must not be doors: the reader's own name has nowhere to go, and
 * a learner who never named themselves has no profile to open.
 */

const push = vi.fn()

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) =>
        values === undefined ? key : `${key}:${Object.values(values).join(",")}`,
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/hooks", () => ({
    useQueryGlobalLeaderboardSwr: vi.fn(),
    useQueryMeSwr: vi.fn(),
    useMutateSetFollowSwr: vi.fn(),
}))

/** One settled SWR answer, shaped the way the barrel hook returns it. */
const answer = (over: Partial<{ data: unknown, error: unknown, mutate: () => void }>) => ({
    data: undefined,
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
    ...over,
}) as never

/** One global-leaderboard entry as the server sends it. */
const entry = (over: Partial<Record<string, unknown>> = {}) => ({
    userGlobalId: "u1",
    username: "ada",
    avatar: null,
    points: 480,
    rank: 1,
    isFollowing: false,
    ...over,
})

/** Wire the board, the viewer and the (unused) follow mutation in one call. */
const wire = (
    board: Partial<{ data: unknown, error: unknown, mutate: () => void }>,
    me: Partial<{ data: unknown }> = { data: { username: "learner", avatar: null } },
) => {
    vi.mocked(useQueryGlobalLeaderboardSwr).mockReturnValue(answer(board))
    vi.mocked(useQueryMeSwr).mockReturnValue(answer(me))
    vi.mocked(useMutateSetFollowSwr).mockReturnValue({ trigger: vi.fn() } as never)
}

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
})

describe("TopLearners", () => {
    it("offers the request again when the board could not be read", () => {
        const mutate = vi.fn()
        wire({ error: new Error("down"), mutate })

        render(<TopLearners />)
        expect(screen.getByText("top.failed")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "retry" }))
        expect(mutate).toHaveBeenCalledOnce()
    })

    it("holds five resting ranks while the board is on its way", () => {
        wire({ data: undefined })

        const { container } = render(<TopLearners />)
        expect(container.querySelectorAll("[data-loading=\"true\"]").length).toBeGreaterThan(0)
        expect(screen.queryByText("top.empty")).toBeNull()
    })

    it.each([
        ["the server answered with nothing at all", null],
        ["nobody has scored yet", { entries: [], myPoints: 0, myRank: 0 }],
    ])("says the board is bare when %s", (_why, data) => {
        wire({ data })

        render(<TopLearners />)
        expect(screen.getByText("top.empty")).toBeInTheDocument()
        expect(screen.queryByText("anonymous")).toBeNull()
    })

    it("cuts the board at five and appends the reader's own standing below it", () => {
        wire({
            data: {
                entries: Array.from({ length: 7 }, (_unused, index) => entry({
                    userGlobalId: `u${index}`,
                    username: `learner-${index}`,
                    rank: index + 1,
                    points: 100 - index,
                })),
                myPoints: 12,
                myRank: 41,
            },
        })

        render(<TopLearners />)
        expect(screen.getByText("learner-4")).toBeInTheDocument()
        expect(screen.getByText("learner-4")).toBeInTheDocument()
        expect(screen.queryByText("learner-5")).toBeNull()
        expect(screen.getByText("learner · you")).toBeInTheDocument()
        // Once in the standing line above the list, once on the appended row itself.
        expect(screen.getAllByText("points:12")).toHaveLength(2)
        expect(screen.getByText("top.rankLine:41")).toBeInTheDocument()
    })

    it("appends nothing extra when the reader is already inside the cut", () => {
        wire({
            data: {
                entries: [
                    entry({ userGlobalId: "u0", username: null, rank: 1 }),
                    entry({ userGlobalId: "u1", username: "learner", rank: 2, points: 300 }),
                ],
                myPoints: 300,
                myRank: 2,
            },
        })

        render(<TopLearners />)
        expect(screen.getByText("anonymous")).toBeInTheDocument()
        expect(screen.getByText("learner · you")).toBeInTheDocument()
        // The nameless entry keeps its rank and its points but borrows the anonymous word.
        expect(screen.getByText("anonymous")).toBeInTheDocument()
    })

    it("makes the reader's own name a plain line rather than a door", () => {
        wire({
            data: {
                entries: [entry({ userGlobalId: "u1", username: "learner", rank: 3, points: 90 })],
                myPoints: 90,
                myRank: 3,
            },
        })

        render(<TopLearners />)
        const own = screen.getByText("learner · you")
        expect(own).toBeInTheDocument()
        fireEvent.click(own)
        expect(push).not.toHaveBeenCalled()
    })

    it("opens another learner's profile by name", () => {
        wire({
            data: {
                entries: [entry({ userGlobalId: "u1", username: "ada", rank: 1 })],
                myPoints: 0,
                myRank: 99,
            },
        })

        render(<TopLearners />)
        fireEvent.click(screen.getByText("ada"))
        expect(push).toHaveBeenCalledWith("/profile/ada")
    })

    it("goes nowhere when a nameless learner's row is pressed", () => {
        wire({
            data: {
                entries: [entry({ userGlobalId: "u1", username: null, rank: 1 })],
                myPoints: 0,
                myRank: 99,
            },
        })

        render(<TopLearners />)
        fireEvent.click(screen.getByText("anonymous"))
        expect(push).not.toHaveBeenCalled()
    })

    it("sends the reader to the full board", () => {
        wire({
            data: { entries: [entry()], myPoints: 0, myRank: 99 },
        })

        render(<TopLearners />)
        fireEvent.click(screen.getByText("seeMore"))
        expect(push).toHaveBeenCalledWith("/league")
    })

    it("draws no follow control, because this card is a preview and not the board", () => {
        wire({
            data: {
                entries: [entry({ userGlobalId: "u1", username: "ada", rank: 1, isFollowing: false })],
                myPoints: 0,
                myRank: 99,
            },
        })

        render(<TopLearners />)
        expect(screen.queryByRole("button", { name: "follow" })).toBeNull()
        expect(screen.queryByRole("button", { name: "followingState" })).toBeNull()
    })
})
