import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ContractContent } from "@/components/branches/Tree"
import { CoursePricingRail, _CoursePricingRail } from "./component"

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

        expect(document.querySelector("[data-component=\"CoursePricingRailScroll\"]")).toBeNull()
        const surface = document.querySelector("[data-component=\"SurfaceCardSurface\"]")
        const scrollRegion = document.querySelector("[data-node=\"pricing-rail-scroll-viewport\"]")
        expect(surface).toHaveAttribute("data-scroll-inside", "pricing-rail")
        expect(scrollRegion).toHaveClass("scrollbar", "overflow-y-auto", "overscroll-contain")
        expect(surface).toContainElement(scrollRegion as HTMLElement)
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
        expect(priceNote).toHaveClass("[&>*]:whitespace-nowrap")
        expect(pricePrimary).toHaveClass("gap-1")
        expect(priceBlock).toHaveClass("gap-2")
        expect(priceBlock?.firstElementChild).toBe(pricePrimary)
        expect(priceNote).toContainElement(screen.getByText("Save 250,000 ₫"))
        expect(priceNote).toContainElement(screen.getByText("Why this price?"))
        expect(document.querySelectorAll("[data-component=\"SurfaceCardSurface\"]")).toHaveLength(1)
        expect(screen.getByRole("tablist", { name: "Choose how to start" })).toBeInTheDocument()
        expect(screen.getByRole("tab", { name: "Buy course" })).toHaveAttribute("aria-selected", "true")
        const purchaseIntent = document.querySelector("[data-node=\"course-pricing-purchase-intent\"]")
        const purchaseCopy = document.querySelector("[data-node=\"course-pricing-purchase-copy\"]")
        const purchaseActions = document.querySelector("[data-node=\"course-pricing-purchase-actions\"]")
        expect(purchaseIntent).toHaveClass("gap-3")
        expect(purchaseCopy).toHaveClass("gap-2")
        expect(purchaseActions).toHaveClass("gap-2")
        expect(purchaseIntent?.firstElementChild).toBe(purchaseCopy)
        expect(purchaseIntent?.lastElementChild).toBe(purchaseActions)
        expect(purchaseCopy).toContainElement(screen.getByText("Own the complete course"))
        expect(purchaseCopy).toContainElement(screen.getByText("Choose a purchase option to start the complete path."))
        expect(purchaseActions).toContainElement(screen.getByRole("button", { name: "Enrol now" }))
        expect(purchaseActions).toContainElement(screen.getByRole("button", { name: "Add to cart" }))
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

    it("draws a bare course as artwork, one price and one action and nothing else", () => {
        render(
            <_CoursePricingRail
                state="ready"
                props={{
                    title: "Fullstack Mastery",
                    coverUrl: "https://cdn.example/fullstack.png",
                    price: "1,250,000 ₫",
                    ctaLabel: "Enrol now",
                }}
            />,
        )

        expect(document.querySelector("[data-component=\"CoverImage\"]")).toHaveAttribute(
            "data-fallback",
            "false",
        )
        expect(screen.getByText("1,250,000 ₫")).toBeInTheDocument()
        expect(document.querySelector("[data-component=\"Badge\"]")).toBeNull()
        expect(document.querySelector("[data-node=\"price-note-row\"]")).toBeNull()
        expect(
            Array.from(document.querySelectorAll("[data-component=\"Button\"]"), (button) => button.textContent),
        ).toEqual(["Enrol now"])
        expect(screen.queryByText("13 learners enrolled")).toBeNull()
        expect(screen.queryByText("Compare phases")).toBeNull()
    })

    it("opens the price breakdown from a course that has no saving to report", () => {
        const openPriceDetail = vi.fn()
        render(
            <_CoursePricingRail
                state="ready"
                props={{ ...props, savingsLabel: undefined }}
                on={{ openPriceDetail }}
            />,
        )

        const note = document.querySelector("[data-node=\"price-note-row\"]")
        expect(note?.childElementCount).toBe(1)
        expect(screen.queryByText("Save 250,000 ₫")).toBeNull()
        fireEvent.click(screen.getByRole("link", { name: "Why this price?" }))
        expect(openPriceDetail).toHaveBeenCalledOnce()
    })

    it("refuses to split the rail's intent on a trial label with no copy to frame it", () => {
        render(
            <_CoursePricingRail
                state="ready"
                props={{ ...props, intent: undefined }}
            />,
        )

        expect(screen.queryByRole("tablist")).toBeNull()
        expect(screen.queryByRole("button", { name: "Trial" })).toBeNull()
        expect(document.querySelector("[data-node=\"course-pricing-exploration-intent\"]")).toBeNull()
        expect(document.querySelector("[data-node=\"course-pricing-purchase-copy\"]")).toBeNull()
        fireEvent.click(screen.getByText("Fullstack Mastery"))
        expect(screen.getByText("Pioneer")).toBeInTheDocument()
    })

    it("projects into a host that has already drawn the rail's surface", () => {
        const act = vi.fn()
        render(
            <ContractContent
                contract="course-pricing-rail"
                render={CoursePricingRail({ state: "ready", props, on: { act } })}
            />,
        )

        expect(document.querySelectorAll("[data-node=\"course-pricing-rail\"]")).toHaveLength(1)
        fireEvent.click(screen.getByRole("button", { name: "Enrol now" }))
        expect(act).toHaveBeenCalledOnce()
    })
})
