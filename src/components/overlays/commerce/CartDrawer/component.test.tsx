import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _CartDrawer, type CartDrawerLabels } from "./component"

/**
 * What these tests guard.
 *
 * The drawer is the quick look at the same basket `/cart` reads properly, so it draws the SAME two
 * blocks rather than narrower copies, and it holds no heading of its own because the panel already
 * names itself in the vendor header.
 *
 * EMPTY AND REFUSED ARE NOT THE SAME SENTENCE. Both hide the lines, the summary and the actions, so
 * the copy is the only thing that can tell a reader whose basket is empty from one nobody has asked
 * to sign in.
 */

const labels: CartDrawerLabels = {
    title: "Basket",
    summary: { subtotal: "Subtotal", savings: "Savings", surcharge: "Fee", total: "Total", unavailable: "Unavailable" },
    checkout: "Checkout",
    viewFullCart: "View full basket",
    emptyMessage: "Your basket is empty.",
    failedMessage: "Sign in to see your basket.",
    failedAction: "Sign in",
    emptyAction: "Browse courses",
}

const lines = [
    { courseId: "course-1", title: "System Design Mastery", cover: null, price: "1.750.000 ₫", removeLabel: "Remove" },
    { courseId: "course-2", title: "TypeScript Deep Dive", cover: null, price: "1.200.000 ₫", removeLabel: "Remove" },
]

describe("_CartDrawer", () => {
    it("draws the shared line and summary blocks with a way through to the deep review", () => {
        const checkout = vi.fn()
        const viewFullCart = vi.fn()
        render(
            <_CartDrawer
                state="ready"
                props={{ labels, isOpen: true, lines, subtotal: "2.950.000 ₫", savings: "-200.000 ₫", total: "2.750.000 ₫" }}
                on={{ checkout, viewFullCart }}
            />,
        )

        expect(document.querySelectorAll("[data-node=\"cart-line-row\"]")).toHaveLength(2)
        expect(screen.getByText("System Design Mastery")).toBeInTheDocument()
        expect(screen.getByText("2.750.000 ₫")).toBeInTheDocument()
        expect(document.querySelector("[data-node=\"order-summary-stack\"]")).not.toBeNull()

        fireEvent.click(screen.getByRole("button", { name: /Checkout/ }))
        expect(checkout).toHaveBeenCalledOnce()
        fireEvent.click(screen.getByRole("button", { name: /View full basket/ }))
        expect(viewFullCart).toHaveBeenCalledOnce()
    })

    it("holds no heading of its own beside the panel name the shell already drew", () => {
        render(
            <_CartDrawer state="ready" props={{ labels, isOpen: true, lines }} />,
        )

        const column = document.querySelector("[data-node=\"cart-drawer-column\"]")
        expect(column?.querySelector("h1, h2, h3")).toBeNull()
        expect(column?.querySelector("[data-component=\"SurfaceCardSurface\"]")).toBeNull()
    })

    it("rests three lines and refuses checkout while the basket is still arriving", () => {
        const checkout = vi.fn()
        render(
            <_CartDrawer state="pending" props={{ labels, isOpen: true }} on={{ checkout }} />,
        )

        expect(document.querySelectorAll("[data-node=\"cart-line-row\"]")).toHaveLength(3)
        const control = screen.getByRole("button", { name: /Checkout/ })
        expect(control).toBeDisabled()
        fireEvent.click(control)
        expect(checkout).not.toHaveBeenCalled()
    })

    it("says the basket is empty and offers the catalogue", () => {
        const browse = vi.fn()
        render(
            <_CartDrawer state="empty" props={{ labels, isOpen: true, lines: [] }} on={{ browse }} />,
        )

        expect(screen.getByText("Your basket is empty.")).toBeInTheDocument()
        expect(document.querySelector("[data-node=\"cart-line-list\"]")).toBeNull()
        expect(document.querySelector("[data-node=\"order-summary-stack\"]")).toBeNull()
        expect(screen.queryByRole("button", { name: /Checkout/ })).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: /Browse courses/ }))
        expect(browse).toHaveBeenCalledOnce()
    })

    it("says a basket that could not be read is refused, not empty", () => {
        const browse = vi.fn()
        render(<_CartDrawer state="failed" props={{ labels, isOpen: true }} on={{ browse }} />)

        expect(screen.getByText("Sign in to see your basket.")).toBeInTheDocument()
        expect(screen.queryByText("Your basket is empty.")).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: /Sign in/ }))
        expect(browse).toHaveBeenCalledOnce()
    })

    it("keeps the lines standing when only the pricing failed", () => {
        render(
            <_CartDrawer
                state="ready"
                props={{ labels, isOpen: true, lines, hasPricingFailed: true }}
            />,
        )

        expect(document.querySelectorAll("[data-node=\"cart-line-row\"]")).toHaveLength(2)
        expect(screen.getByText("System Design Mastery")).toBeInTheDocument()
        expect(screen.getAllByText("Unavailable").length).toBeGreaterThan(0)
    })

    it("stays dismissable when nothing is listening for the way out", () => {
        render(<_CartDrawer state="ready" props={{ labels, isOpen: true, lines }} />)

        expect(screen.getByText("System Design Mastery")).toBeInTheDocument()
        expect(() => fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape", code: "Escape" })).not.toThrow()
    })
})
