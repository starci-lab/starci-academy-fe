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
        fireEvent.click(screen.getByRole("button", { name: "Continue" }))
        expect(open).toHaveBeenCalledWith("lesson")
    })

    it("renders a real anchor when the owner already knows the destination", () => {
        const open = vi.fn()
        render(<CourseNextActions state="ready" props={{
            label: "Next actions",
            actions: [{ id: "cards", title: "Review cards", kind: "Flashcards", actionLabel: "Review", href: "/courses/foundations/flashcards" }],
        }} on={{ open }} />)

        const link = screen.getByRole("link", { name: "Review" })
        expect(link.getAttribute("href")).toBe("/courses/foundations/flashcards")
        expect(screen.queryByRole("button", { name: "Review" })).toBeNull()
        fireEvent.click(link)
        expect(open).toHaveBeenCalledWith("cards")
    })

    it("owns its settled empty answer", () => {
        render(<CourseNextActions state="empty" props={{ label: "Next actions", message: "Nothing to continue" }} />)
        expect(screen.getByText("Nothing to continue")).toBeTruthy()
    })
})
