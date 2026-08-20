import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CoursePersonalProjectResultPageBase } from "./component"

describe("CoursePersonalProjectResultPageBase", () => {
    it("keeps attempt history before latest structured feedback", () => {
        const { container } = render(
            <CoursePersonalProjectResultPageBase
                state="ready"
                props={{
                    title: "Build the API client",
                    description: "Review grading history.",
                    attemptsLabel: "Attempt history",
                    feedbackLabel: "Latest feedback",
                    attempts: [
                        { id: "attempt-2", label: "Attempt 2: 18 points · Passed" },
                        { id: "attempt-1", label: "Attempt 1: 12 points · Needs another pass" },
                    ],
                    feedbacks: [{ id: "feedback-1", label: "Add timeout handling" }],
                    retryTaskLabel: "Return to task",
                }}
                on={{ retryTask: vi.fn() }}
            />,
        )

        const text = container.textContent ?? ""
        expect(text.indexOf("Attempt history")).toBeLessThan(text.indexOf("Latest feedback"))
        expect(screen.getByText("Add timeout handling")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Return to task" })).toBeEnabled()
    })

    it("renders an honest empty state when no graded attempt exists", () => {
        render(
            <CoursePersonalProjectResultPageBase
                state="empty"
                props={{
                    title: "Task result",
                    description: "Review grading history.",
                    attemptsLabel: "Attempt history",
                    feedbackLabel: "Latest feedback",
                    attempts: [],
                    feedbacks: [],
                    notice: "No submission has been graded yet.",
                    retryTaskLabel: "Return to task",
                }}
                on={{ retryTask: vi.fn() }}
            />,
        )

        expect(screen.getByRole("status")).toHaveTextContent("No submission has been graded yet.")
        expect(screen.getByRole("button", { name: "Return to task" })).toBeEnabled()
    })
})
