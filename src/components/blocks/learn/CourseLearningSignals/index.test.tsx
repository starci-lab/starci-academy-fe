import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseLearningSignals } from "."

describe("CourseLearningSignals", () => {
    it("renders three supporting facts and reports selection", () => {
        const select = vi.fn()
        render(<CourseLearningSignals state="ready" props={{
            label: "Learning signals",
            signals: [
                { id: "review", label: "Due review", fact: "3 cards", actionLabel: "View review", isSelected: true },
                { id: "continuity", label: "Study continuity", fact: "6 days", actionLabel: "View continuity", isSelected: false },
                { id: "standing", label: "Course standing", fact: "Rank #18", actionLabel: "View standing", isSelected: false },
            ],
        }} on={{ select }} />)

        expect(screen.getByText("3 cards")).toBeTruthy()
        expect(screen.getByText("6 days")).toBeTruthy()
        expect(screen.getByText("Rank #18")).toBeTruthy()
        fireEvent.click(screen.getByRole("button", { name: "View continuity" }))
        expect(select).toHaveBeenCalledWith("continuity")
    })

    it("preserves three rows while pending", () => {
        const { container } = render(<CourseLearningSignals state="pending" props={{ label: "Learning signals" }} />)
        expect(container.querySelectorAll("[data-node=course-learning-signal-row]")).toHaveLength(3)
    })
})
