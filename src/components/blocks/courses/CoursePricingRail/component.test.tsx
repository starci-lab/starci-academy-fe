import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CoursePricingRail } from "./component"

class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock)

const props = {
    title: "Fullstack Mastery",
    price: "1,250,000 ₫",
    originalPrice: "1,500,000 ₫",
    discountLabel: "−17%",
    savingsLabel: "Save 250,000 ₫",
    priceDetailLabel: "Why this price?",
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
    intent: {
        intentTabsLabel: "Choose how to start",
        purchaseModeLabel: "Buy course",
        trialModeLabel: "Trial",
        purchaseTitle: "Own the complete course",
        purchaseDescription: "Choose a purchase option to start the complete path.",
        trialTitle: "Explore before enrolling",
        trialDescription: "Try open content before deciding.",
        phaseDisclosureLabel: "Compare phases",
    },
}

describe("_CoursePricingRail", () => {
    it("keeps one surface while separating purchase and exploration intent", () => {
        const act = vi.fn()
        const trial = vi.fn()
        const addToCart = vi.fn()
        render(<_CoursePricingRail state="ready" props={props} on={{ act, trial, addToCart }} />)

        const scroll = document.querySelector("[data-component=\"CoursePricingRailScroll\"]")
        expect(scroll).toHaveClass("max-h-pricing-rail")
        expect(scroll?.className).toContain("scroll-shadow--hide-scrollbar")
        expect(document.querySelector("[data-component=\"SurfaceCardSurface\"]")).toBeTruthy()
        expect(screen.getAllByText("Early")).toHaveLength(2)
        expect(screen.getByText("100 seats left in Early")).toBeInTheDocument()
        expect(screen.getByText("−17%").closest("[data-component=\"Badge\"]")).toHaveAttribute(
            "data-tone",
            "success",
        )
        const priceNote = document.querySelector("[data-node=\"price-note-row\"]")
        const pricePrimary = document.querySelector("[data-node=\"course-price-primary-group\"]")
        const priceBlock = document.querySelector("[data-node=\"course-price-block\"]")
        expect(priceNote).toHaveClass("flex-nowrap")
        expect(pricePrimary).toHaveClass("gap-1")
        expect(priceBlock).toHaveClass("gap-2")
        expect(priceBlock?.firstElementChild).toBe(pricePrimary)
        expect(priceNote).toContainElement(screen.getByText("Save 250,000 ₫"))
        expect(priceNote).toContainElement(screen.getByText("Why this price?"))
        expect(document.querySelectorAll("[data-component=\"SurfaceCardSurface\"]")).toHaveLength(1)
        expect(screen.getByRole("tablist", { name: "Choose how to start" })).toBeInTheDocument()
        expect(screen.getByRole("tab", { name: "Buy course" })).toHaveAttribute("aria-selected", "true")
        expect(document.querySelector("[data-node=\"course-pricing-purchase-intent\"]")).toBeTruthy()
        expect(document.querySelector("[data-node=\"course-pricing-exploration-intent\"]")).toBeNull()
        expect(
            Array.from(document.querySelectorAll("[data-component=\"Button\"]")).map(
                (button) => button.textContent,
            ),
        ).toEqual(["Enrol now", "Add to cart"])
        expect(screen.getByRole("button", { name: "Enrol now" })).toHaveAttribute(
            "data-icon-placement",
            "trailing",
        )
        expect(screen.getByRole("button", { name: "Add to cart" }).querySelector("svg")).toBeNull()
        fireEvent.click(screen.getByText("Compare phases"))
        expect(screen.getByText("Pioneer")).toBeInTheDocument()
        expect(screen.getByText("Standard")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("tab", { name: "Trial" }))
        expect(document.querySelector("[data-node=\"course-pricing-purchase-intent\"]")).toBeNull()
        expect(document.querySelector("[data-node=\"course-pricing-exploration-intent\"]")).toBeTruthy()
        expect(screen.getByText("1,250,000 ₫")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Trial" })).toHaveAttribute("data-variant", "tertiary")
        fireEvent.click(screen.getByRole("button", { name: "Trial" }))
        fireEvent.click(screen.getByRole("tab", { name: "Buy course" }))
        fireEvent.click(screen.getByRole("button", { name: "Enrol now" }))
        fireEvent.click(screen.getByRole("button", { name: "Add to cart" }))
        expect(act).toHaveBeenCalledOnce()
        expect(trial).toHaveBeenCalledOnce()
        expect(addToCart).toHaveBeenCalledOnce()
        expect(document.querySelector("[data-node=\"course-pricing-rail\"]")?.className).toContain("p-4")
    })

    it("omits optional exploration and disclosure when their data is absent", () => {
        render(
            <_CoursePricingRail
                state="ready"
                props={{ ...props, trialLabel: undefined, phases: [], intent: undefined }}
            />,
        )
        expect(document.querySelector("[data-node=\"course-pricing-exploration-intent\"]")).toBeNull()
        expect(screen.queryByRole("tablist")).toBeNull()
        expect(screen.queryByText("Compare phases")).toBeNull()
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
        if (state === "trialing") fireEvent.click(screen.getByRole("tab", { name: "Trial" }))
        const buttons = document.querySelectorAll("[data-component=\"Button\"]")
        for (const button of buttons) {
            expect(button).toHaveAttribute("data-action-pending", button.textContent === pendingLabel ? "true" : "false")
        }
    })
})
