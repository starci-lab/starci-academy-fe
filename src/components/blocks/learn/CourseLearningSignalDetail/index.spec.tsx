import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseLearningSignalDetail } from "."

describe("CourseLearningSignalDetail", () => {
    it("keeps the selected signal attached to its evidence and onward action", () => {
        const open = vi.fn()
        render(<CourseLearningSignalDetail state="ready" props={{
            label: "Signal detail",
            title: "Due review",
            fact: "3 cards",
            caption: "Three cards are ready.",
            actionLabel: "Open details",
        }} on={{ open }} />)

        expect(screen.getByText("Three cards are ready.")).toBeTruthy()
        fireEvent.click(screen.getByRole("button", { name: "Open details" }))
        expect(open).toHaveBeenCalledOnce()
    })

    it("renders a real anchor when the detail carries a destination", () => {
        const open = vi.fn()
        render(<CourseLearningSignalDetail state="ready" props={{
            label: "Signal detail",
            title: "Due review",
            fact: "3 cards",
            caption: "Three cards are ready.",
            actionLabel: "Open details",
            href: "/courses/foundations/signals/due-review",
        }} on={{ open }} />)

        const link = screen.getByRole("link", { name: "Open details" })
        expect(link.getAttribute("href")).toBe("/courses/foundations/signals/due-review")
        fireEvent.click(link)
        expect(open).toHaveBeenCalledOnce()
    })

    it("owns its empty outcome", () => {
        render(<CourseLearningSignalDetail state="empty" props={{ label: "Signal detail", message: "Choose a signal" }} />)
        expect(screen.getByText("Choose a signal")).toBeTruthy()
    })
})
