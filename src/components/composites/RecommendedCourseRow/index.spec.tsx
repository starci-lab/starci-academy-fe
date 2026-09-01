import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { RecommendedCourseRow } from "./index"

describe("RecommendedCourseRow", () => {
    it("draws the whole row as one destination named after the course", () => {
        const open = vi.fn()
        const { container } = render(<RecommendedCourseRow
            props={{ id: "one", title: "Backend basics", price: "990.000 ₫", actionLabel: "View course" }}
            on={{ open }}
        />)
        const surface = screen.getByRole("button", { name: "Backend basics" })
        expect(screen.getByText("Backend basics")).toBeInTheDocument()
        expect(screen.getByText("990.000 ₫")).toBeInTheDocument()
        expect(screen.getByText("View course")).toHaveAttribute("data-tone", "accent")
        const action = container.querySelector("[data-destination-cue='true']")
        const caret = container.querySelector("[data-destination-cue-caret='true']")
        expect(action?.firstElementChild).toHaveTextContent("View course")
        expect(action?.lastElementChild).toBe(caret)
        expect(caret).toHaveClass("group-hover:translate-x-1")
        expect(container.querySelector("[data-recommended-course-body='true']")).toHaveClass("gap-2")
        expect(container.querySelector("[data-recommended-course-body='true']")).not.toHaveClass("gap-1")
        fireEvent.click(surface)
        expect(open).toHaveBeenCalledOnce()
    })

    it("omits the list price, the discount, the saving and the reason a course does not have", () => {
        render(<RecommendedCourseRow props={{ id: "one", title: "Backend basics", price: "990.000 ₫" }} />)
        expect(screen.getByText("Backend basics")).toBeInTheDocument()
        expect(screen.getByText("990.000 ₫")).toBeInTheDocument()
        expect(screen.queryByRole("link")).toBeNull()
    })

    it("rules through the superseded list price and badges what the discount takes off", () => {
        render(<RecommendedCourseRow props={{
            id: "one",
            title: "Backend basics",
            price: "690.000 ₫",
            originalPrice: "990.000 ₫",
            discount: "-30%",
        }} />)
        expect(screen.getByText("990.000 ₫")).toBeInTheDocument()
        expect(screen.getByText("-30%")).toBeInTheDocument()
    })

    it("puts the saving and the question about it on one line, and reports the question", () => {
        const openPriceDetail = vi.fn()
        render(<RecommendedCourseRow
            props={{
                id: "one",
                title: "Backend basics",
                price: "690.000 ₫",
                savings: "You save 300.000 ₫",
                priceDetailLabel: "Why this price?",
            }}
            on={{ openPriceDetail }}
        />)
        expect(screen.getByText("You save 300.000 ₫")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("link", { name: "Why this price?" }))
        expect(openPriceDetail).toHaveBeenCalledOnce()
    })

    it("still offers the question when there is no saving to state beside it", () => {
        render(<RecommendedCourseRow props={{
            id: "one",
            title: "Backend basics",
            price: "690.000 ₫",
            priceDetailLabel: "Why this price?",
        }} />)
        expect(screen.getByRole("link", { name: "Why this price?" })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Why this price?" })).toBeInTheDocument()
    })

    it("says why the course is being suggested when the caller has a reason", () => {
        render(<RecommendedCourseRow props={{
            id: "one",
            title: "Backend basics",
            price: "690.000 ₫",
            reason: "Because you finished Node fundamentals",
        }} />)
        expect(screen.getByText("Because you finished Node fundamentals")).toHaveAttribute("data-tone", "default")
    })

    it("draws the course artwork on the mark when the course has any", () => {
        const { container } = render(<RecommendedCourseRow props={{
            id: "one",
            title: "Backend basics",
            cover: "https://example.com/cover.png",
        }} />)
        expect(container.querySelector("img")).toBeInTheDocument()
    })

    it("rests every line and refuses the press while the recommendation is in flight", () => {
        const open = vi.fn()
        render(<RecommendedCourseRow
            props={{ id: "resting", price: "—", originalPrice: "—", priceDetailLabel: "Why this price?", savings: "—" }}
            on={{ open }}
            isLoading
        />)
        const surface = screen.getByRole("button", { name: "Course" })
        expect(surface).toBeDisabled()
        expect(surface).toHaveAttribute("aria-busy", "true")
        fireEvent.click(surface)
        expect(open).not.toHaveBeenCalled()
    })
})
