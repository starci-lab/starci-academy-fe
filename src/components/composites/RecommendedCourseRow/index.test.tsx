import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { RecommendedCourseRow } from "./index"

const texts = (root: HTMLElement, size: string) =>
    Array.from(root.querySelectorAll(`[data-component="Text"][data-size="${size}"]`), (node) => node.textContent)

describe("RecommendedCourseRow", () => {
    it("draws the whole row as one destination named after the course", () => {
        const open = vi.fn()
        const { container } = render(<RecommendedCourseRow
            props={{ id: "one", title: "Backend basics", price: "990.000 ₫" }}
            on={{ open }}
        />)
        const surface = screen.getByRole("button", { name: "Backend basics" })
        expect(surface).toHaveAttribute("data-hover", "label")
        expect(container.querySelector("[data-node=\"recommended-course-row\"]")).toBeInTheDocument()
        expect(texts(container, "md")).toEqual(["Backend basics"])
        expect(texts(container, "sm")).toEqual(["990.000 ₫"])
        fireEvent.click(surface)
        expect(open).toHaveBeenCalledOnce()
    })

    it("omits the list price, the discount, the saving and the reason a course does not have", () => {
        const { container } = render(<RecommendedCourseRow props={{ id: "one", title: "Backend basics", price: "990.000 ₫" }} />)
        expect(container.querySelector("[data-component=\"Badge\"]")).toBeNull()
        expect(container.querySelector("[data-component=\"TextLink\"]")).toBeNull()
        expect(container.querySelector("[data-node=\"price-note-row\"]")).toBeNull()
        expect(texts(container, "xs")).toEqual([])
    })

    it("rules through the superseded list price and badges what the discount takes off", () => {
        const { container } = render(<RecommendedCourseRow props={{
            id: "one",
            title: "Backend basics",
            price: "690.000 ₫",
            originalPrice: "990.000 ₫",
            discount: "-30%",
        }} />)
        const original = container.querySelector("[data-component=\"Text\"][data-size=\"xs\"]")
        expect(original?.textContent).toBe("990.000 ₫")
        expect(original).toHaveAttribute("data-superseded", "true")
        expect(container.querySelector("[data-component=\"Badge\"]")?.textContent).toBe("-30%")
    })

    it("puts the saving and the question about it on one line, and reports the question", () => {
        const openPriceDetail = vi.fn()
        const { container } = render(<RecommendedCourseRow
            props={{
                id: "one",
                title: "Backend basics",
                price: "690.000 ₫",
                savings: "You save 300.000 ₫",
                priceDetailLabel: "Why this price?",
            }}
            on={{ openPriceDetail }}
        />)
        const note = container.querySelector("[data-node=\"price-note-row\"]")
        expect(note?.textContent).toBe("You save 300.000 ₫Why this price?")
        fireEvent.click(screen.getByRole("link", { name: "Why this price?" }))
        expect(openPriceDetail).toHaveBeenCalledOnce()
    })

    it("still offers the question when there is no saving to state beside it", () => {
        const { container } = render(<RecommendedCourseRow props={{
            id: "one",
            title: "Backend basics",
            price: "690.000 ₫",
            priceDetailLabel: "Why this price?",
        }} />)
        expect(container.querySelector("[data-node=\"price-note-row\"]")?.textContent).toBe("Why this price?")
        expect(container.querySelector("[data-component=\"TextLink\"]")).toHaveAttribute("data-size", "xs")
    })

    it("says why the course is being suggested when the caller has a reason", () => {
        const { container } = render(<RecommendedCourseRow props={{
            id: "one",
            title: "Backend basics",
            price: "690.000 ₫",
            reason: "Because you finished Node fundamentals",
        }} />)
        expect(texts(container, "xs")).toEqual(["Because you finished Node fundamentals"])
    })

    it("draws the course artwork on the mark when the course has any", () => {
        const { container } = render(<RecommendedCourseRow props={{
            id: "one",
            title: "Backend basics",
            cover: "https://example.com/cover.png",
        }} />)
        expect(container.querySelector("[data-component=\"IconTile\"]")).toHaveAttribute("data-artwork", "true")
    })

    it("rests every line and refuses the press while the recommendation is in flight", () => {
        const open = vi.fn()
        const { container } = render(<RecommendedCourseRow
            props={{ id: "resting", price: "—", originalPrice: "—", priceDetailLabel: "Why this price?", savings: "—" }}
            on={{ open }}
            isLoading
        />)
        const surface = screen.getByRole("button", { name: "Course" })
        expect(surface).toBeDisabled()
        expect(surface).toHaveAttribute("aria-busy", "true")
        expect(container.querySelector("[data-component=\"IconTile\"]")).toHaveAttribute("data-loading", "true")
        expect(container.querySelector("[data-component=\"Text\"][data-size=\"md\"]")).toHaveAttribute("data-loading", "true")
        fireEvent.click(surface)
        expect(open).not.toHaveBeenCalled()
    })
})
