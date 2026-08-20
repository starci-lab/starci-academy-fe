import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CoursePersonalProjectResultPage } from "./index"

type BaseProps = { state: string; props: { historyOpen: boolean }; on?: Record<string, () => void> }
const mocks = vi.hoisted(() => ({ project: vi.fn(), attempts: vi.fn(), feedbacks: vi.fn(), push: vi.fn(), history: "0" }))

vi.mock("@/hooks/swr/useQueryCoursePersonalProjectSwr", () => ({ useQueryCoursePersonalProjectSwr: mocks.project }))
vi.mock("@/hooks/swr/useQueryPersonalTaskAttemptsSwr", () => ({ useQueryPersonalTaskAttemptsSwr: mocks.attempts }))
vi.mock("@/hooks/swr/useQueryPersonalTaskAttemptFeedbacksSwr", () => ({ useQueryPersonalTaskAttemptFeedbacksSwr: mocks.feedbacks }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("next-intl", () => ({ useLocale: () => "en" }))
vi.mock("next/navigation", () => ({ useSearchParams: () => ({ get: () => mocks.history }) }))
vi.mock("./component", () => ({
    CoursePersonalProjectResultPageBase: ({ state, props: { historyOpen }, on }: BaseProps) => <>
        <div data-testid="state">{state}</div>
        <div data-testid="history">{String(historyOpen)}</div>
        <button onClick={on?.retryTask}>retry</button>
        <button onClick={on?.nextTask}>next task</button>
    </>,
}))

const projectData = {
    course: { id: "course-1" },
    milestones: [{ tasks: [
        { id: "task-1", title: "Task one", maxScore: 10, description: "Do it" },
        { id: "task-2", title: "Task two", maxScore: 10, description: "Continue" },
    ] }],
}
const attempt = { id: "attempt-1", attemptNumber: 1, score: 9, passed: true, processedAt: null, servedModel: null }

describe("CoursePersonalProjectResultPage", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.history = "0"
        mocks.project.mockReturnValue({ data: projectData, error: undefined })
        mocks.attempts.mockReturnValue({ data: { data: [attempt], count: 1 }, error: undefined })
        mocks.feedbacks.mockReturnValue({ data: [{ id: "feedback-1", message: "Good work" }], error: undefined })
    })

    it.each([
        [undefined, undefined, undefined, "pending"],
        [projectData, new Error("attempts"), [], "failed"],
        [projectData, undefined, [], "empty"],
        [projectData, undefined, [attempt], "ready"],
    ])("maps result data to %s state", (project, attemptsError, rows, state) => {
        mocks.project.mockReturnValue({ data: project, error: undefined })
        mocks.attempts.mockReturnValue({ data: rows === undefined ? undefined : { data: rows, count: rows.length }, error: attemptsError })
        mocks.feedbacks.mockReturnValue({ data: [], error: undefined })
        render(<CoursePersonalProjectResultPage displayId="course" taskId="task-1" />)
        expect(screen.getByTestId("state")).toHaveTextContent(state)
    })

    it("opens history from the route and preserves task navigation", async () => {
        mocks.history = "1"
        render(<CoursePersonalProjectResultPage displayId="course" taskId="task-1" />)
        await waitFor(() => expect(screen.getByTestId("history")).toHaveTextContent("true"))

        fireEvent.click(screen.getByText("retry"))
        fireEvent.click(screen.getByText("next task"))
        expect(mocks.push).toHaveBeenNthCalledWith(1, "/courses/course/learn/personal-project/tasks/task-1")
        expect(mocks.push).toHaveBeenNthCalledWith(2, "/courses/course/learn/personal-project/tasks/task-2")
    })
})
