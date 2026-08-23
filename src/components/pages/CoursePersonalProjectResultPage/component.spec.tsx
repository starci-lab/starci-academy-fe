import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PersonalProjectResultBase, type CoursePersonalProjectResultLabels } from "@/components/blocks/learn/PersonalProjectResult/component"

vi.mock("@/components/overlays/learn/PersonalProjectHistoryDrawer", () => ({
    PersonalProjectHistoryDrawer: () => <div data-testid="history-drawer" />,
}))

const labels: CoursePersonalProjectResultLabels = {
    back: "Back to task", attempt: (number) => `Attempt ${number}`,
    score: (score, maximum) => `${score}/${maximum} points`, passed: "Passed", needsWork: "Needs work",
    feedback: "Structured feedback", history: "Attempt history", historySummary: (count) => `${count} attempts`,
    selectAttempt: (number, score) => `Attempt ${number} · ${score} points`, previous: "Previous", next: "Next",
    nextTask: "Continue to next task", retryTask: "Return to task",
}

const props = {
    title: "Build the API client",
    description: "Review grading history.",
    maximumScore: 20,
    selectedAttempt: { id: "attempt-2", attemptNumber: 2, score: 18, passed: true },
    feedbacks: [{ id: "feedback-1", message: "Add timeout handling" }],
    labels,
}

describe("PersonalProjectResultBase", () => {
    it("renders the selected score, verdict and structured feedback", () => {
        render(<PersonalProjectResultBase state="ready" props={props} taskId="task-1" historyOpen={false} on={{ retryTask: vi.fn() }} />)

        expect(screen.getByText("18/20 points")).toBeInTheDocument()
        expect(screen.getByText("Passed")).toBeInTheDocument()
        expect(screen.getByText("Add timeout handling")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Return to task" })).toBeEnabled()
    })

    it("renders an honest empty result when no attempt exists", () => {
        render(<PersonalProjectResultBase
            state="empty"
            props={{ ...props, selectedAttempt: undefined, feedbacks: [], notice: "No graded attempt yet." }}
            taskId="task-1"
            historyOpen={false}
        />)

        expect(screen.getByText("No graded attempt yet.")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Continue to next task" })).toBeDisabled()
    })
})
