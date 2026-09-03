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

    it("lets a long trailing fact wrap on the line itself rather than in a wrapper", () => {
        const { container } = render(<CourseProgressRow props={{
            ...row,
            percentLabel: "Đã hoàn thành 87% chương trình",
            dimensions: [{ id: "lessons", label: "Bài học", completed: 12, total: 40, percent: 30, tone: "accent" }],
        }} />)
        const facts = container.querySelectorAll("[data-component='Text'][data-overflow='wrap']")
        expect(facts).toHaveLength(2)
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
