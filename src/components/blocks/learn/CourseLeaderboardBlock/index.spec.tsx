import { act, render } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type TestInput = { state: string; on: { course: () => void; selectCategory: (category: string) => void; climb: () => void; retry: () => void } }
const mocks = vi.hoisted(() => ({
    input: undefined as TestInput | undefined,
    course: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    me: { data: { id: "me", username: "me", avatar: null } as unknown },
    board: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    push: vi.fn(), locale: "en",
}))

vi.mock("next-intl", () => ({ useLocale: () => mocks.locale }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => mocks.course }))
vi.mock("@/hooks/swr/useQueryMeSwr", () => ({ useQueryMeSwr: () => mocks.me }))
vi.mock("@/hooks/swr/useQueryCourseLeaderboardSwr", () => ({ useQueryCourseLeaderboardSwr: () => mocks.board }))
vi.mock("./component", () => ({ CourseLeaderboardBlockBase: (input: TestInput) => { mocks.input = input; return <output data-testid="leaderboard" /> } }))

import { CourseLeaderboardBlock } from "./index"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.input = undefined
    mocks.course.data = { id: "c1", title: "Course", isEnrolled: true }
    mocks.course.error = undefined
    mocks.board.data = undefined
    mocks.board.error = undefined
})

describe("CourseLeaderboardBlock", () => {
    it("maps pending, empty, ready and viewer ranking branches", () => {
        const view = render(<CourseLeaderboardBlock displayId="course" category="challenge" />)
        expect(mocks.input?.state).toBe("pending")
        mocks.board.data = { entries: [] }
        view.rerender(<CourseLeaderboardBlock displayId="course" category="challenge" />)
        expect(mocks.input?.state).toBe("empty")
        mocks.board.data = { entries: [1, 2, 3, 4].map((rank) => ({ enrollmentId: `e${rank}`, userId: rank === 4 ? "me" : `u${rank}`, username: `user-${rank}`, avatar: null, totalXp: rank * 10, totalScore: rank, lessonsRead: rank, milestoneProgress: rank })), myRank: { rank: 8, totalXp: 100, totalScore: 10, lessonsRead: 4, milestoneProgress: 2 }, computedAt: "2026-01-01" }
        view.rerender(<CourseLeaderboardBlock displayId="course" category="challenge" />)
        expect(mocks.input?.state).toBe("ready")
        act(() => { mocks.input?.on.course(); mocks.input?.on.selectCategory("reading"); mocks.input?.on.selectCategory("invalid"); mocks.input?.on.climb(); mocks.input?.on.retry() })
        expect(mocks.push).toHaveBeenCalledWith("/courses/course")
        expect(mocks.board.mutate).toHaveBeenCalled()
    })
})
