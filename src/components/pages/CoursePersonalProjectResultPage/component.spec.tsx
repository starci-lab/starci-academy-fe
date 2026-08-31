import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PersonalProjectResultBase, type CoursePersonalProjectResultLabels } from "@/components/blocks/learn/PersonalProjectResult/component"

vi.mock("@/components/overlays/learn/PersonalProjectHistoryDrawer", () => ({
    PersonalProjectHistoryDrawer: () => <div data-testid="history-drawer" />,
}))

const labels: CoursePersonalProjectResultLabels = {
    back: "Back to task", attempt: (number) => `Attempt ${number}`,
    score: (score, maximum) => `${score}/${maximum} points`, passed: "Passed", needsWork: "Needs work",
    feedback: "Structured feedback", history: "Attempt history", actions: "Result actions", historySummary: (count) => `${count} attempts`,
    selectAttempt: (number, score) => `Attempt ${number} · ${score} points`, previous: "Previous", next: "Next",
    nextTask: "Continue to next task", retryTask: "Edit settings and resubmit", reviewStatus: "Review status", refresh: "Refresh result",
}

const props = {
    title: "Build the API client",
    description: "Review grading history.",
    maximumScore: 20,
    selectedAttempt: { id: "attempt-2", attemptNumber: 2, score: 18, passed: true, servedProvider: "openrouter", servedModel: "review-pro" },
    feedbacks: [{ id: "feedback-1", message: "Add timeout handling" }],
    labels,
}

describe("PersonalProjectResultBase", () => {
    it("renders the selected score, verdict and structured feedback", () => {
        render(<PersonalProjectResultBase state="ready" props={props} taskId="task-1" historyOpen={false} on={{ retryTask: vi.fn() }} />)

        expect(screen.getByText("18/20 points")).toBeInTheDocument()
        expect(screen.getByText("Passed")).toBeInTheDocument()
        expect(screen.getByText(/openrouter · review-pro/u)).toBeInTheDocument()
        expect(screen.getByText("Add timeout handling")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Edit settings and resubmit" })).toBeEnabled()
    })

    it("renders an honest empty result when no attempt exists", () => {
        render(<PersonalProjectResultBase
            state="empty"
            props={{ ...props, selectedAttempt: undefined, feedbacks: [], notice: "No graded attempt yet." }}
            taskId="task-1"
            historyOpen={false}
        />)

        expect(screen.getByText("No graded attempt yet.")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Continue to next task" })).not.toBeInTheDocument()
    })

    it("keeps an accepted review visibly queued instead of misreporting an empty history", () => {
        render(<PersonalProjectResultBase
            state="queued"
            props={{ ...props, selectedAttempt: undefined, feedbacks: [], notice: "Review accepted." }}
            taskId="task-1"
            historyOpen={false}
            on={{ refresh: vi.fn() }}
        />)

        expect(screen.getByText("Review accepted.")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Refresh result" })).toBeEnabled()
    })

    it("renders a terminal review failure with a clear route back to repository settings", () => {
        render(<PersonalProjectResultBase
            state="failed"
            props={{ ...props, selectedAttempt: undefined, feedbacks: [], notice: "Repository or branch could not be read." }}
            taskId="task-1"
            historyOpen={false}
            on={{ retryTask: vi.fn() }}
        />)

        expect(screen.getByRole("alert")).toHaveTextContent("Repository or branch could not be read.")
        expect(screen.getByRole("button", { name: "Edit settings and resubmit" })).toBeEnabled()
        expect(screen.queryByRole("button", { name: "Attempt history" })).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Refresh result" })).not.toBeInTheDocument()
    })
})
