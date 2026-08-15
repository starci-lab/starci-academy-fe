import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CoursePricingRail } from "./component"

const props = {
    title: "Fullstack Mastery",
    price: "1,250,000 ₫",
    originalPrice: "1,500,000 ₫",
    discountLabel: "−17%",
    savingsLabel: "Save 250,000 ₫",
    scarcityLabel: "100 seats left in Early",
    phases: [
        { id: "pioneer", name: "Pioneer", value: "1,000,000 ₫" },
        { id: "early", name: "Early", value: "Open now", isActive: true },
        { id: "standard", name: "Standard", value: "1,500,000 ₫" },
    ],
    ctaLabel: "Enrol now",
    trialLabel: "Trial",
    cartLabel: "Add to cart",
    enrolmentLabel: "13 learners enrolled",
}

describe("_CoursePricingRail", () => {
    it("keeps one sticky-card decision with compact phase comparison", () => {
        const act = vi.fn()
        const trial = vi.fn()
        const addToCart = vi.fn()
        render(<_CoursePricingRail state="ready" props={props} on={{ act, trial, addToCart }} />)

        expect(document.querySelector("[data-component=\"SurfaceCardSurface\"]")).toBeTruthy()
        expect(screen.getAllByText("Early")).toHaveLength(2)
        expect(screen.getByText("100 seats left in Early")).toBeInTheDocument()
        expect(document.querySelectorAll("[data-node=\"course-pricing-phase-card\"]")).toHaveLength(3)
        expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual([
            "Enrol now",
            "Add to cart",
            "Trial",
        ])
        expect(screen.getByRole("button", { name: "Add to cart" }).querySelector("svg")).toBeNull()
        fireEvent.click(screen.getByRole("button", { name: "Enrol now" }))
        fireEvent.click(screen.getByRole("button", { name: "Trial" }))
        fireEvent.click(screen.getByRole("button", { name: "Add to cart" }))
        expect(act).toHaveBeenCalledOnce()
        expect(trial).toHaveBeenCalledOnce()
        expect(addToCart).toHaveBeenCalledOnce()
        expect(document.querySelector("[data-node=\"course-pricing-rail\"]")?.className).toContain("p-4")
    })

    it("keeps the cart action available as the legacy add/remove toggle", () => {
        const addToCart = vi.fn()
        render(
            <_CoursePricingRail
                state="ready"
                props={{ ...props, isInCart: true, cartLabel: "Remove from cart" }}
                on={{ addToCart }}
            />,
        )

        const remove = screen.getByRole("button", { name: "Remove from cart" })
        expect(remove).toBeEnabled()
        expect(remove.querySelector("svg")).toBeNull()
        fireEvent.click(remove)
        expect(addToCart).toHaveBeenCalledOnce()
    })

    it("rests only the unresolved price", () => {
        render(<_CoursePricingRail state="price-pending" props={{ ...props, price: undefined }} />)
        expect(screen.getByText("100 seats left in Early")).toBeInTheDocument()
        expect(screen.queryByText("1,250,000 ₫")).toBeNull()
    })

    it.each([
        ["checking-out", "Enrol now"],
        ["adding", "Add to cart"],
        ["trialing", "Trial"],
    ] as const)("keeps pending ownership on only the %s action", (state, pendingLabel) => {
        render(<_CoursePricingRail state={state} props={props} />)
        const buttons = screen.getAllByRole("button")
        for (const button of buttons) {
            expect(button).toHaveAttribute("data-action-pending", button.textContent === pendingLabel ? "true" : "false")
        }
    })
})
