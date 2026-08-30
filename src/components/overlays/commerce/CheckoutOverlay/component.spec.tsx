import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CheckoutOverlayBase, type CheckoutOverlayLabels } from "./component"

const labels: CheckoutOverlayLabels = {
    title: "Review payment",
    subtitle: "2 courses will be added after payment is confirmed.",
    methodTitle: "Payment method",
    provider: "Bank transfer via PayOS",
    providerDescription: "Finish the transfer on PayOS.",
    summary: {
        subtotal: "Subtotal",
        savings: "Savings",
        surcharge: "Instalment fee",
        total: "Total",
        unavailable: "Unavailable",
    },
    processTitle: "What happens next",
    handoffStep: "Continue to PayOS.",
    verificationStep: "Payment stays pending until the webhook confirms it.",
    accessStep: "Access is granted after confirmation.",
    trustNote: "A browser redirect alone never marks an order as paid.",
    action: "Continue to PayOS · 2,750,000 ₫",
    cancel: "Back to basket",
    failedMessage: "Could not open PayOS.",
}

describe("CheckoutOverlayBase", () => {
    it("shows the payable total, one real method and the webhook-owned sequence", () => {
        render(
            <CheckoutOverlayBase
                props={{
                    labels,
                    isOpen: true,
                    subtotal: "2,950,000 ₫",
                    savings: "-200,000 ₫",
                    total: "2,750,000 ₫",
                }}
            />,
        )

        expect(screen.getByRole("heading", { name: "Review payment" })).toBeInTheDocument()
        expect(screen.getByText("Bank transfer via PayOS")).toBeInTheDocument()
        expect(screen.getByText("Payment stays pending until the webhook confirms it.")).toBeInTheDocument()
        expect(screen.getByText("2,750,000 ₫")).toBeInTheDocument()
        expect(screen.queryByText("Instalment fee")).not.toBeInTheDocument()
    })

    it("hands off once and exposes progress on the exact action", () => {
        const pay = vi.fn()
        const { rerender } = render(
            <CheckoutOverlayBase props={{ labels, isOpen: true }} on={{ pay }} />,
        )

        const control = screen.getByRole("button", { name: /Continue to PayOS/ })
        fireEvent.click(control)
        expect(pay).toHaveBeenCalledOnce()

        rerender(
            <CheckoutOverlayBase props={{ labels, isOpen: true, isPaying: true }} on={{ pay }} />,
        )
        expect(screen.getByRole("button", { name: /Continue to PayOS/ })).toHaveAttribute("data-action-pending", "true")
        expect(screen.getByRole("button", { name: "Back to basket" })).toBeDisabled()
    })

    it("reports a recoverable provider hand-off failure without claiming payment failed", () => {
        render(<CheckoutOverlayBase props={{ labels, isOpen: true, hasFailed: true }} />)
        expect(screen.getByRole("alert")).toHaveTextContent("Could not open PayOS.")
        expect(screen.getByRole("button", { name: /Continue to PayOS/ })).toBeEnabled()
    })

    it("supports both the explicit escape action and the modal's own dismissal", () => {
        const dismiss = vi.fn()
        render(<CheckoutOverlayBase props={{ labels, isOpen: true }} on={{ dismiss }} />)

        fireEvent.click(screen.getByRole("button", { name: "Back to basket" }))
        fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape", code: "Escape" })
        expect(dismiss).toHaveBeenCalledTimes(2)
    })
})
