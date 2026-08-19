import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseCatalogCardBase, type CourseCatalogCardData } from "./component"

const course: CourseCatalogCardData = {
    id: "backend-basics",
    title: "Backend basics",
    cover: "https://example.com/cover.png",
    enrolmentLabel: "1.240 learners",
    price: "690.000 ₫",
    promises: ["Ship an API", "Deploy it", "Keep it up"],
    promisesSummary: "3 promises",
    cartLabel: "Add to cart",
    viewLabel: "View course",
}

const promises = (root: HTMLElement) =>
    Array.from(root.querySelectorAll("[data-node=\"marked-row-list\"] [data-node=\"task-mark-title-fact-row\"]"), (row) => row.textContent)

describe("CourseCatalogCardBase", () => {
    it("stands one purchasable course on its own card, promises and all", () => {
        const { container } = render(<CourseCatalogCardBase state="ready" props={course} />)
        expect(container.querySelector("[data-node=\"catalog-card\"]")).toBeInTheDocument()
        expect(container.querySelector("[data-node=\"catalog-card-line\"]")).toBeNull()
        expect(container.querySelector("[data-component=\"Heading\"]")?.textContent).toBe("Backend basics")
        expect(container.querySelector("[data-node=\"catalog-card-heading-row\"]")?.textContent)
            .toBe("Backend basics1.240 learners")
        expect(promises(container)).toEqual(["Ship an API", "Deploy it", "Keep it up"])
        expect(container.querySelector("[data-component=\"SurfaceListCard\"]")?.textContent)
            .toContain("3 promises")
    })

    it("omits the list price, the discount and the whole price note a full-price course has none of", () => {
        const { container } = render(<CourseCatalogCardBase state="ready" props={course} />)
        expect(container.querySelector("[data-component=\"Badge\"]")).toBeNull()
        expect(container.querySelector("[data-node=\"price-note-row\"]")).toBeNull()
        expect(container.querySelector("[data-component=\"TextLink\"]")).toBeNull()
        expect(container.querySelector("[data-node=\"price-discount-line\"]")?.textContent).toBe("690.000 ₫")
    })

    it("rules through the list price and badges the discount when one applies", () => {
        const { container } = render(<CourseCatalogCardBase state="ready" props={{
            ...course,
            originalPrice: "990.000 ₫",
            discountLabel: "-30%",
        }} />)
        const original = container.querySelector("[data-node=\"price-discount-line\"] [data-superseded=\"true\"]")
        expect(original?.textContent).toBe("990.000 ₫")
        expect(container.querySelector("[data-component=\"Badge\"]")?.textContent).toBe("-30%")
    })

    it("puts the saving beside the question about it and reports that question", () => {
        const openPriceDetail = vi.fn()
        const { container } = render(<CourseCatalogCardBase
            state="ready"
            props={{ ...course, savingsLabel: "You save 300.000 ₫", priceDetailLabel: "Why this price?" }}
            on={{ openPriceDetail }}
        />)
        expect(container.querySelector("[data-node=\"price-note-row\"]")?.textContent)
            .toBe("You save 300.000 ₫Why this price?")
        fireEvent.click(screen.getByRole("link", { name: "Why this price?" }))
        expect(openPriceDetail).toHaveBeenCalledOnce()
    })

    it("still offers the question when there is no saving to state beside it", () => {
        const { container } = render(<CourseCatalogCardBase
            state="ready"
            props={{ ...course, priceDetailLabel: "Why this price?" }}
        />)
        expect(container.querySelector("[data-node=\"price-note-row\"]")?.textContent).toBe("Why this price?")
    })

    it("offers both ways in and reports each to its own caller", () => {
        const view = vi.fn()
        const addToCart = vi.fn()
        render(<CourseCatalogCardBase state="ready" props={course} on={{ view, addToCart }} />)
        fireEvent.click(screen.getByRole("button", { name: "Add to cart" }))
        expect(addToCart).toHaveBeenCalledOnce()
        fireEvent.click(screen.getByRole("button", { name: "View course" }))
        expect(view).toHaveBeenCalledOnce()
    })

    it("ranks the cart quieter than the way into the course", () => {
        const { container } = render(<CourseCatalogCardBase state="ready" props={course} />)
        expect(Array.from(container.querySelectorAll("[data-component=\"Button\"]"), (button) => button.getAttribute("data-variant")))
            .toEqual(["secondary", "primary"])
    })

    it("stops offering to add a course that is already sitting in the cart", () => {
        const addToCart = vi.fn()
        render(<CourseCatalogCardBase
            state="ready"
            props={{ ...course, isInCart: true, cartLabel: "In cart" }}
            on={{ addToCart }}
        />)
        const cart = screen.getByRole("button", { name: "In cart" })
        expect(cart).toBeDisabled()
        fireEvent.click(cart)
        expect(addToCart).not.toHaveBeenCalled()
        expect(screen.getByRole("button", { name: "View course" })).toBeEnabled()
    })

    it("spins the cart alone while this exact add is running", () => {
        const { container } = render(<CourseCatalogCardBase state="adding" props={course} />)
        const [cart, open] = container.querySelectorAll("[data-component=\"Button\"]")
        expect(cart).toHaveAttribute("data-action-pending", "true")
        expect(open).toHaveAttribute("data-action-pending", "false")
        expect(open).toBeEnabled()
    })

    it("rests the title, the price, the promises and both actions while the grid is in flight", () => {
        const { container } = render(<CourseCatalogCardBase state="pending" props={{
            id: "resting-1",
            originalPrice: "—",
            discountLabel: "—",
        }} />)
        expect(container.querySelector("[data-component=\"Heading\"]")).toHaveAttribute("data-loading", "true")
        expect(container.querySelector("[data-component=\"CoverImage\"]")).toHaveAttribute("data-loading", "true")
        expect(container.querySelector("[data-component=\"Badge\"]")).toHaveAttribute("data-loading", "true")
        expect(promises(container)).toEqual([])
        expect(container.querySelector("[data-component=\"SurfaceListCard\"]")).toBeInTheDocument()
        const buttons = container.querySelectorAll("[data-component=\"Button\"]")
        expect(buttons).toHaveLength(2)
        expect(buttons[0]).toBeDisabled()
        expect(buttons[1]).toBeDisabled()
    })

    it("draws the token fallback for a course with no artwork of its own", () => {
        const { container } = render(<CourseCatalogCardBase state="ready" props={{ ...course, cover: undefined }} />)
        expect(container.querySelector("[data-component=\"CoverImage\"]")).toHaveAttribute("data-fallback", "true")
    })

    it("drops the promises in the line arrangement but keeps the price and both ways in", () => {
        const view = vi.fn()
        const addToCart = vi.fn()
        const { container } = render(<CourseCatalogCardBase
            state="ready"
            props={{ ...course, layout: "line", priceDetailLabel: "Why this price?" }}
            on={{ view, addToCart }}
        />)
        expect(container.querySelector("[data-node=\"catalog-card-line\"]")).toBeInTheDocument()
        expect(container.querySelector("[data-node=\"catalog-card\"]")).toBeNull()
        expect(container.querySelector("[data-component=\"SurfaceListCard\"]")).toBeNull()
        expect(promises(container)).toEqual([])
        expect(container.querySelector("[data-node=\"title-with-baseline-fact\"]")?.textContent)
            .toBe("Backend basics1.240 learners")
        expect(container.querySelector("[data-node=\"price-note-row\"]")?.textContent).toBe("Why this price?")
        fireEvent.click(screen.getByRole("button", { name: "Add to cart" }))
        expect(addToCart).toHaveBeenCalledOnce()
        fireEvent.click(screen.getByRole("button", { name: "View course" }))
        expect(view).toHaveBeenCalledOnce()
    })

    it("reads the enrolment fact at the body step in a line, not at the caption step", () => {
        const { container } = render(<CourseCatalogCardBase state="ready" props={{ ...course, layout: "line" }} />)
        const fact = container.querySelector("[data-node=\"title-with-baseline-fact\"] [data-component=\"Text\"]")
        expect(fact).toHaveAttribute("data-size", "sm")
        expect(fact).toHaveAttribute("data-tone", "muted")
    })

    it("keeps naming both actions in words when a resting card has no labels yet", () => {
        const { container } = render(<CourseCatalogCardBase state="pending" props={{ id: "resting-2", layout: "line" }} />)
        expect(Array.from(container.querySelectorAll("[data-component=\"Button\"]"), (button) => button.textContent))
            .toEqual(["", ""])
    })
})
