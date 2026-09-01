import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseProgressRow } from "."

const row = {
    id: "fullstack",
    title: "Fullstack Mastery",
    actionLabel: "Tiếp tục học",
    dimensions: [],
} as const

describe("CourseProgressRow", () => {
    it("keeps the resume words before the trailing arrow and moves only that arrow on hover", () => {
        const { container } = render(<CourseProgressRow props={row} />)
        const action = container.querySelector("[data-destination-cue='true']")
        const caret = container.querySelector("[data-destination-cue-caret='true']")

        expect(action?.firstElementChild).toHaveTextContent("Tiếp tục học")
        expect(action?.lastElementChild).toBe(caret)
        expect(caret).toHaveClass("group-hover:translate-x-1")
        expect(caret).toHaveClass("group-focus-visible:translate-x-1")
    })

    it("retains one whole-row destination", () => {
        const open = vi.fn()
        render(<CourseProgressRow props={row} on={{ open }} />)
        const destination = screen.getByRole("button", { name: "Fullstack Mastery" })

        expect(screen.queryByRole("link")).toBeNull()
        fireEvent.click(destination)
        expect(open).toHaveBeenCalledOnce()
    })
})
