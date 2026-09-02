import { act, render, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type TestInput = { blockState: string; on: { open: (id: string) => void; selectSignal: (id: string) => void; openSignal: () => void; retry: () => void } }
const mocks = vi.hoisted(() => ({
    input: undefined as TestInput | undefined,
    course: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    myCourses: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    lessons: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    challenges: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    decks: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    project: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    interview: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    leaderboard: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    weekly: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    route: { trigger: vi.fn().mockResolvedValue({ data: { resolveRoute: { data: { path: "/resolved" } } } }) },
    push: vi.fn(), view: "today",
}))

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => mocks.course }))
vi.mock("@/hooks/swr/useQueryMyCoursesSwr", () => ({ useQueryMyCoursesSwr: () => mocks.myCourses }))
vi.mock("@/hooks/swr/useQueryMyLearnedLessonsSwr", () => ({ useQueryMyLearnedLessonsSwr: () => mocks.lessons }))
vi.mock("@/hooks/swr/useQueryMyInProgressChallengesSwr", () => ({ useQueryMyInProgressChallengesSwr: () => mocks.challenges }))
vi.mock("@/hooks/swr/useQueryFlashcardDecksByCourseSwr", () => ({ useQueryFlashcardDecksByCourseSwr: () => mocks.decks }))
vi.mock("@/hooks/swr/useQueryCoursePersonalProjectSwr", () => ({ useQueryCoursePersonalProjectSwr: () => mocks.project }))
vi.mock("@/hooks/swr/useQueryMyInProgressMockInterviewSessionSwr", () => ({ useQueryMyInProgressMockInterviewSessionSwr: () => mocks.interview }))
vi.mock("@/hooks/swr/useQueryCourseLeaderboardSwr", () => ({ useQueryCourseLeaderboardSwr: () => mocks.leaderboard }))
vi.mock("@/hooks/swr/useQueryMyWeeklyStatsSwr", () => ({ useQueryMyWeeklyStatsSwr: () => mocks.weekly }))
vi.mock("@/hooks/swr/useQueryResolveRouteSwr", () => ({ useQueryResolveRouteSwr: () => mocks.route }))
vi.mock("@/components/product-shells/LearnShellLayout", () => ({ useLearnMobileView: () => ({ view: mocks.view }) }))
vi.mock("./component", () => ({ CourseLearnTodayBlockBase: (props: TestInput) => { mocks.input = props; return <output data-testid="today" /> } }))

import { CourseLearnTodayBlock } from "./index"

beforeEach(() => {
    vi.clearAllMocks()
    mocks.input = undefined
    mocks.view = "today"
    for (const item of [mocks.course, mocks.myCourses, mocks.lessons, mocks.challenges, mocks.decks, mocks.project, mocks.interview, mocks.leaderboard, mocks.weekly]) {
        item.data = undefined
        item.error = undefined
    }
})

describe("CourseLearnTodayBlock", () => {
    it("moves from pending through failure to the complete dashboard", async () => {
        const view = render(<CourseLearnTodayBlock displayId="course" />)
        expect(mocks.input?.blockState).toBe("pending")
        mocks.course.error = new Error("offline")
        view.rerender(<CourseLearnTodayBlock displayId="course" />)
        expect(mocks.input?.blockState).toBe("failed")

        mocks.course.error = undefined
        mocks.course.data = { id: "c1", title: "Course" }
        mocks.myCourses.data = [{ globalId: "c1", completionPercent: 50 }]
        mocks.lessons.data = [{ globalId: "gid://Content/1", label: "Lesson" }]
        mocks.challenges.data = []
        mocks.decks.data = [{ dueCount: 2 }]
        mocks.project.data = { currentTask: { id: "task" } }
        mocks.interview.data = null
        mocks.leaderboard.data = { myRank: { rank: 3 } }
        mocks.weekly.data = { streak: 4 }
        view.rerender(<CourseLearnTodayBlock displayId="course" />)
        expect(mocks.input?.blockState).toBe("ready")

        act(() => { mocks.input?.on.open("flashcards") })
        act(() => { mocks.input?.on.open("project:task") })
        act(() => { mocks.input?.on.open("resolve:gid://Content/1") })
        await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/resolved"))
        act(() => { mocks.input?.on.selectSignal("standing") })
        act(() => { mocks.input?.on.openSignal() })
        act(() => { mocks.input?.on.retry() })
        expect(mocks.course.mutate).toHaveBeenCalled()
    })
})
