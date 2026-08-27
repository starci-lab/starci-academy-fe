import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CheckoutOverlayBase, type CheckoutOverlayLabels } from "./component"

/**
 * What these tests guard.
 *
 * IT OPENS ON PAYING AT ONCE, and everything that belongs to paying over time appears only once that
 * plan is selected: the schedule, the surcharge line and the warning. Opening on instalments would
 * collect a surcharge from every buyer who did not notice.
 *
 * THE MARK IS ONLY DRAWN WHERE IT IS TRUE. `StatusDot`'s tones are all affirmative and it requires
 * an accessible name, so a cycle that is not the one due keeps a resting line in that slot rather
 * than a dot that would claim something about it.
 */

const labels: CheckoutOverlayLabels = {
    title: "Checkout",
    planLabel: "How to pay",
    payFull: "Pay in full",
    payInstalments: "Pay over time",
    summary: {
        subtotal: "Subtotal",
        savings: "Savings",
        surcharge: "Instalment fee",
        total: "Total",
        unavailable: "Unavailable",
    },
    terms: "Nothing is charged automatically.",
    gateways: "SePay and PayOS",
    action: "Pay 2.750.000 ₫",
}

const cycles = [
    {
        id: "cycle-1",
        name: "First cycle · today · 50%",
        amount: "1.375.000 ₫",
        isCurrent: true,
    },
    {
        id: "cycle-2",
        name: "Second cycle · in 30 days · 50%",
        amount: "1.375.000 ₫",
    },
]

describe("CheckoutOverlayBase", () => {
    it("opens on paying at once, with no schedule, no surcharge and no warning", () => {
        render(
            <CheckoutOverlayBase
                props={{
                    labels,
                    isOpen: true,
                    plan: "full",
                    subtotal: "2.950.000 ₫",
                    savings: "-200.000 ₫",
                    total: "2.750.000 ₫",
                    cycles,
                }}
            />,
        )

        expect(screen.queryByText("First cycle · today · 50%")).toBeNull()
        expect(
            screen.queryByText("Nothing is charged automatically."),
        ).not.toBeInTheDocument()
        expect(screen.queryByText("Instalment fee")).not.toBeInTheDocument()
        expect(screen.getByText("SePay and PayOS")).toBeInTheDocument()
        expect(screen.getByText("2.750.000 ₫")).toBeInTheDocument()
    })

    it("draws the schedule and the warning only once paying over time is chosen", () => {
        render(
            <CheckoutOverlayBase
                props={{
                    labels,
                    isOpen: true,
                    plan: "instalments",
                    subtotal: "2.950.000 ₫",
                    surcharge: "150.000 ₫",
                    total: "2.900.000 ₫",
                    cycles,
                }}
            />,
        )

        expect(screen.getByText("First cycle · today · 50%")).toBeInTheDocument()
        expect(
            screen.getByText("Nothing is charged automatically."),
        ).toBeInTheDocument()
        expect(screen.getByText("Instalment fee")).toBeInTheDocument()
        expect(screen.getByText("First cycle · today · 50%")).toBeInTheDocument()
    })

    it("marks only the cycle that is actually due", () => {
        render(
            <CheckoutOverlayBase
                props={{ labels, isOpen: true, plan: "instalments", cycles }}
            />,
        )

        expect(screen.getByText("First cycle · today · 50%")).toBeInTheDocument()
        expect(
            screen.getByText("Second cycle · in 30 days · 50%"),
        ).toBeInTheDocument()
    })

    it("draws no empty ladder when paying over time carries no cycles yet", () => {
        render(
            <CheckoutOverlayBase
                props={{ labels, isOpen: true, plan: "instalments" }}
            />,
        )

        expect(screen.queryByText("First cycle · today · 50%")).toBeNull()
        expect(
            screen.getByText("Nothing is charged automatically."),
        ).toBeInTheDocument()
    })

    it("reports the plan the reader switched to", () => {
        const choosePlan = vi.fn()
        render(
            <CheckoutOverlayBase
                props={{ labels, isOpen: true, plan: "full" }}
                on={{ choosePlan }}
            />,
        )

        fireEvent.click(screen.getByText("Pay over time"))
        expect(choosePlan).toHaveBeenCalledWith("instalments")
    })

    it("hands off to the provider on the press and says so while it is in flight", () => {
        const pay = vi.fn()
        const { rerender } = render(
            <CheckoutOverlayBase
                props={{ labels, isOpen: true, plan: "full" }}
                on={{ pay }}
            />,
        )

        const control = screen.getByRole("button", { name: /Pay 2\.750\.000/ })
        expect(control).toHaveAttribute("data-action-pending", "false")
        fireEvent.click(control)
        expect(pay).toHaveBeenCalledOnce()

        rerender(
            <CheckoutOverlayBase
                props={{ labels, isOpen: true, plan: "full", isPaying: true }}
                on={{ pay }}
            />,
        )
        expect(
            screen.getByRole("button", { name: /Pay 2\.750\.000/ }),
        ).toHaveAttribute("data-action-pending", "true")
    })

    it("stays dismissable when nothing is listening for the way out", () => {
        render(
            <CheckoutOverlayBase props={{ labels, isOpen: true, plan: "full" }} />,
        )

        expect(screen.getByRole("dialog")).toBeInTheDocument()
        expect(() =>
            fireEvent.keyDown(screen.getByRole("dialog"), {
                key: "Escape",
                code: "Escape",
            }),
        ).not.toThrow()
    })

    it("reports the vendor's own way out to the surface that mounted it", () => {
        const dismiss = vi.fn()
        render(
            <CheckoutOverlayBase
                props={{ labels, isOpen: true, plan: "full" }}
                on={{ dismiss }}
            />,
        )

        fireEvent.keyDown(screen.getByRole("dialog"), {
            key: "Escape",
            code: "Escape",
        })
        expect(dismiss).toHaveBeenCalled()
    })
})
