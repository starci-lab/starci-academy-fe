import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Pagination } from "./index"

const frame = {
    label: "Course pages",
    previousLabel: "Previous page",
    nextLabel: "Next page",
} as const

describe("Pagination", () => {
    it("shows first, last, the current page and one neighbour either side with gaps between", () => {
        const { container } = render(<Pagination props={{ ...frame, total: 10, page: 5 }} />)
        const control = container.querySelector("[aria-label=\"Course pages\"]")
        expect(control).toHaveAttribute("data-page", "5")
        expect(control).toHaveAttribute("data-total", "10")
        expect(control).toHaveAttribute("aria-label", "Course pages")
        expect(Array.from(container.querySelectorAll("li"), (item) => item.textContent))
            .toEqual(["", "1", "…", "4", "5", "6", "…", "10", ""])
        expect(screen.getByRole("button", { name: "5" })).toHaveAttribute("aria-current", "page")
        expect(screen.getByRole("button", { name: "4" })).not.toHaveAttribute("aria-current")
    })

    it("reports the 1-based page a reader asked for and stays silent on the page it is already on", () => {
        const change = vi.fn()
        render(<Pagination props={{ ...frame, total: 10, page: 5 }} on={{ change }} />)
        fireEvent.click(screen.getByRole("button", { name: "4" }))
        expect(change).toHaveBeenCalledExactlyOnceWith(4)
        change.mockClear()
        fireEvent.click(screen.getByRole("button", { name: "5" }))
        expect(change).not.toHaveBeenCalled()
    })

    it("steps one page back and one page forward from the ends of the window", () => {
        const change = vi.fn()
        render(<Pagination props={{ ...frame, total: 10, page: 5 }} on={{ change }} />)
        fireEvent.click(screen.getByRole("button", { name: "Previous page" }))
        expect(change).toHaveBeenCalledExactlyOnceWith(4)
        change.mockClear()
        fireEvent.click(screen.getByRole("button", { name: "Next page" }))
        expect(change).toHaveBeenCalledExactlyOnceWith(6)
    })

    it("closes the first gap when the current page already touches the start", () => {
        const { container } = render(<Pagination props={{ ...frame, total: 6, page: 2 }} />)
        expect(Array.from(container.querySelectorAll("li"), (item) => item.textContent))
            .toEqual(["", "1", "2", "3", "…", "6", ""])
        expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled()
    })

    it("disables the way back on the first page and the way on from the last", () => {
        const first = render(<Pagination props={{ ...frame, total: 4, page: 1 }} />)
        expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled()
        expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled()
        first.unmount()

        render(<Pagination props={{ ...frame, total: 4, page: 4 }} />)
        expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled()
        expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled()
    })

    it("clamps a page past the end and a fractional page onto a real page", () => {
        const { container } = render(<Pagination props={{ ...frame, total: 3.7, page: 99 }} />)
        expect(container.querySelector("[aria-label=\"Course pages\"]")).toHaveAttribute("data-page", "3")
        expect(container.querySelector("[aria-label=\"Course pages\"]")).toHaveAttribute("data-total", "3")
    })

    it("keeps one page when the count is empty, with no way off it", () => {
        const change = vi.fn()
        const { container } = render(<Pagination props={{ ...frame, total: 0, page: 0 }} on={{ change }} />)
        expect(container.querySelector("[aria-label=\"Course pages\"]")).toHaveAttribute("data-total", "1")
        expect(Array.from(container.querySelectorAll("li"), (item) => item.textContent)).toEqual(["", "1", ""])
        fireEvent.click(screen.getByRole("button", { name: "1" }))
        expect(change).not.toHaveBeenCalled()
    })

    it("draws the window without reporting anything when no caller is listening", () => {
        render(<Pagination props={{ ...frame, total: 5, page: 3 }} />)
        fireEvent.click(screen.getByRole("button", { name: "2" }))
        expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument()
    })
})
