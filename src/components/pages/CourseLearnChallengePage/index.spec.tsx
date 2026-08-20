import { act, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type CapturedPageInput = {
    readonly state: string
    readonly props: {
        readonly courseMap: {
            readonly props: {
                readonly modules: ReadonlyArray<{
                    readonly lessons: ReadonlyArray<{ readonly id: string; readonly isCurrent: boolean }>
                }>
            }
        }
    }
    readonly on: {
        readonly back: () => void
        readonly openCourseMapItem: (id: string) => void
    }
}

const m = vi.hoisted(() => ({
    content: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    course: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    outline: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    progress: { data: undefined as unknown, error: undefined as unknown, mutate: vi.fn() },
    submission: { trigger: vi.fn(), isMutating: false },
    push: vi.fn(),
    pageInput: undefined as CapturedPageInput | undefined,
}))

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Readonly<Record<string, number>>) => (
        values === undefined ? key : `${key}:${Object.values(values).join("/")}`
    ),
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: m.push }) }))
vi.mock("@/hooks/swr/useQueryContentSwr", () => ({ useQueryContentSwr: () => m.content }))
vi.mock("@/hooks/swr/useQueryCourseSwr", () => ({ useQueryCourseSwr: () => m.course }))
vi.mock("@/hooks/swr/useQueryCourseOutlineSwr", () => ({ useQueryCourseOutlineSwr: () => m.outline }))
vi.mock("@/hooks/swr/useQueryContentChallengeProgressSwr", () => ({
    useQueryContentChallengeProgressSwr: () => m.progress,
}))
vi.mock("@/hooks/swr/useMutateSubmitContentChallengeSwr", () => ({
    useMutateSubmitContentChallengeSwr: () => m.submission,
}))
vi.mock("./component", () => ({
    CourseLearnChallengePageBase: (input: CapturedPageInput) => {
        m.pageInput = input
        return <output data-testid="state">{input.state}</output>
    },
}))

import { CourseLearnChallengePage } from "./index"

const challenge = (submissions: ReadonlyArray<Readonly<Record<string, unknown>>> | null) => ({
    id: "challenge-1",
    displayId: "gateway",
    title: "Gateway challenge",
    description: "Build the gateway.",
    score: 70,
    difficulty: "hard",
    orderIndex: 0,
    hint: "Keep policy separate.",
    submissions,
})

const readyQueries = (submissions: ReadonlyArray<Readonly<Record<string, unknown>>> | null) => {
    m.content.data = { challenges: [challenge(submissions)] }
    m.course.data = { id: "course-1" }
    m.progress.data = [{ id: "challenge-1", completed: false, lastScore: 0, maxScore: 70 }]
    m.outline.data = {
        progress: { lessonsRead: 4, lessonsTotal: 10, completionPercent: 40 },
        modules: [{
            id: "module-1",
            title: "Security",
            lessons: [{
                id: "content-1",
                title: "Identity",
                minutesRead: 20,
                isRead: true,
                challenges: [{
                    id: "challenge-1",
                    title: "Gateway challenge",
                    maxScore: 70,
                    completed: false,
                }],
            }],
        }],
    }
}

beforeEach(() => {
    vi.clearAllMocks()
    m.content.data = undefined
    m.content.error = undefined
    m.course.data = undefined
    m.course.error = undefined
    m.outline.data = undefined
    m.outline.error = undefined
    m.progress.data = undefined
    m.progress.error = undefined
    m.pageInput = undefined
})

describe("CourseLearnChallengePage route", () => {
    it("renders pending while dependent challenge data is unresolved", () => {
        render(
            <CourseLearnChallengePage
                displayId="course"
                contentId="content-1"
                moduleId="module-1"
                challengeId="challenge-1"
            />,
        )
        expect(screen.getByTestId("state")).toHaveTextContent("pending")
    })

    it("normalizes a legacy null submissions list into the settled failure owner", () => {
        readyQueries(null)
        render(
            <CourseLearnChallengePage
                displayId="course"
                contentId="content-1"
                moduleId="module-1"
                challengeId="challenge-1"
            />,
        )

        expect(screen.getByTestId("state")).toHaveTextContent("failed")
        expect(m.pageInput).toBeDefined()
    })

    it("marks the routed challenge in the reused course map and preserves its real route", () => {
        readyQueries([{
            id: "submission-1",
            title: "Repository",
            description: "Submit a repository.",
            score: 70,
            sortIndex: 0,
        }])
        render(
            <CourseLearnChallengePage
                displayId="course"
                contentId="content-1"
                moduleId="module-1"
                challengeId="challenge-1"
            />,
        )

        expect(screen.getByTestId("state")).toHaveTextContent("ready")
        const current = m.pageInput?.props.courseMap.props.modules
            .flatMap((module) => module.lessons)
            .find((row) => row.isCurrent)
        expect(current?.id).toBe("challenge:challenge-1")

        act(() => m.pageInput?.on.openCourseMapItem("challenge:challenge-1"))
        expect(m.push).toHaveBeenCalledWith(
            "/courses/course/learn/content/modules/module-1/contents/content-1/challenges/challenge-1",
        )
        act(() => m.pageInput?.on.back())
        expect(m.push).toHaveBeenCalledWith(
            "/courses/course/learn/content/modules/module-1/contents/content-1",
        )
    })
})
