import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseNextActions } from "."

describe("CourseNextActions", () => {
    it("keeps priority order and reports the selected destination", () => {
        const open = vi.fn()
        render(<CourseNextActions state="ready" props={{
            label: "Next actions",
            actions: [
                { id: "lesson", title: "Resume lesson", kind: "Lesson", actionLabel: "Continue" },
                { id: "cards", title: "Review cards", kind: "Flashcards", actionLabel: "Review" },
            ],
        }} on={{ open }} />)

        expect(screen.getAllByText(/Resume lesson|Review cards/).map((node) => node.textContent)).toEqual(["Resume lesson", "Review cards"])
        fireEvent.click(screen.getByRole("link", { name: "Continue" }))
        expect(open).toHaveBeenCalledWith("lesson")
    })

    it("owns its settled empty answer", () => {
        render(<CourseNextActions state="empty" props={{ label: "Next actions", message: "Nothing to continue" }} />)
        expect(screen.getByText("Nothing to continue")).toBeTruthy()
    })
})
