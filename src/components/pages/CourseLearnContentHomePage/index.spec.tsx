import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CourseLearnContentHomePage } from "./index"

type CourseContentMapMockProps = { readonly displayId: string }

const mocks = vi.hoisted(() => ({
    push: vi.fn(),
    mutateCourse: vi.fn(),
    mutateOutline: vi.fn(),
    course: {
        data: {
            id: "course-1",
            displayId: "system-design",
            title: "System Design Mastery",
            description: "Design production systems",
            originalPrice: 100,
            enrollmentCount: 320,
            isEnrolled: false,
            modules: [{
                id: "module-1",
                title: "Foundations",
                orderIndex: 1,
                contentTier: "foundation",
                numContents: 1,
                contents: [{ id: "lesson-1", minutesRead: 45, numChallenges: 1 }],
            }],
        },
        error: undefined,
    },
    outline: {
        data: {
            course: { id: "course-1", displayId: "system-design", title: "System Design Mastery" },
            modules: [{
                id: "module-1",
                title: "Foundations",
                orderIndex: 1,
                isPremium: false,
                lessons: [{
                    id: "lesson-1",
                    displayId: "hashing",
                    title: "Consistent hashing",
                    minutesRead: 45,
                    difficulty: "beginner",
                    isPremium: false,
                    isRead: false,
                    challenges: [{
                        id: "challenge-1",
                        title: "Rebalance shards",
                        difficulty: "medium",
                        maxScore: 100,
                        status: "notStarted",
                        lastScore: 0,
                        completed: false,
                    }],
                }],
            }],
            milestones: [],
            progress: {
                lessonsRead: 0,
                lessonsTotal: 1,
                challengesCompleted: 0,
                challengesTotal: 1,
                tasksCompleted: 0,
                tasksTotal: 0,
                completionPercent: 0,
            },
            currentTask: { kind: "lesson", id: "lesson-1", milestoneId: null },
            nextContentTask: { kind: "lesson", id: "lesson-1", milestoneId: null },
        },
        error: undefined,
    },
}))

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) => (
        values === undefined ? key : `${key}:${JSON.stringify(values)}`
    ),
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({
    useQueryCourseSwr: () => ({ ...mocks.course, mutate: mocks.mutateCourse }),
}))
vi.mock("@/hooks/swr/useQueryCourseOutlineSwr", () => ({
    useQueryCourseOutlineSwr: () => ({ ...mocks.outline, mutate: mocks.mutateOutline }),
}))
vi.mock("@/components/blocks/learn/CourseContentMap", () => ({
    CourseContentMap: ({ displayId }: CourseContentMapMockProps) => <div data-testid="course-map">{displayId}</div>,
}))

describe("CourseLearnContentHomePage", () => {
    beforeEach(() => vi.clearAllMocks())

    it("seats the course map beside source-backed overview evidence", () => {
        render(<CourseLearnContentHomePage displayId="system-design" />)

        expect(screen.getByTestId("course-map")).toHaveTextContent("system-design")
        expect(screen.getByText("trialNotice")).toBeVisible()
        expect(screen.getByRole("heading", { level: 2, name: "Consistent hashing" })).toBeVisible()

        fireEvent.click(screen.getByRole("button", { name: "resumeAction" }))
        expect(mocks.push).toHaveBeenCalledWith(
            "/courses/system-design/learn/content/modules/module-1/contents/lesson-1",
        )
    })

    it("keeps failure and empty outline states distinct", () => {
        const settledOutline = mocks.outline.data
        const view = render(<CourseLearnContentHomePage displayId="system-design" />)
        mocks.outline.data = undefined as never
        mocks.outline.error = new Error("offline") as never
        view.rerender(<CourseLearnContentHomePage displayId="system-design" />)
        expect(screen.queryByRole("heading", { level: 2, name: "Consistent hashing" })).not.toBeInTheDocument()
        mocks.outline.error = undefined
        mocks.outline.data = { ...settledOutline, modules: [] }
        view.rerender(<CourseLearnContentHomePage displayId="system-design" />)
        expect(screen.queryByRole("heading", { level: 2, name: "Consistent hashing" })).not.toBeInTheDocument()
    })
})
