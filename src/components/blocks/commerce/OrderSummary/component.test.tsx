import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { _OrderSummary } from "./component"

const labels = {
    subtotal: "Subtotal",
    savings: "Bundle saving",
    surcharge: "Instalment fee (5%)",
    total: "Total",
    unavailable: "Price unavailable",
}

const rows = () =>
    Array.from(
        document.querySelectorAll("[data-node=\"label-with-muted-fact-row\"]"),
        (row) => row.textContent,
    )

const totalRow = () => document.querySelector("[data-node=\"order-total-row\"]")

describe("_OrderSummary", () => {
    it("names every component of the order above the figure the reader owes", () => {
        render(
            <_OrderSummary
                state="ready"
                props={{
                    labels,
                    subtotal: "2,500,000 ₫",
                    savings: "−250,000 ₫",
                    surcharge: "112,500 ₫",
                    total: "2,362,500 ₫",
                }}
            />,
        )

        expect(rows()).toEqual([
            "Subtotal2,500,000 ₫",
            "Bundle saving−250,000 ₫",
            "Instalment fee (5%)112,500 ₫",
        ])
        expect(totalRow()?.textContent).toBe("Total2,362,500 ₫")
        expect(screen.getByText("2,362,500 ₫")).toHaveAttribute("data-size", "md")
        expect(screen.getByText("2,500,000 ₫")).toHaveAttribute("data-tone", "muted")
        expect(screen.queryByText("Price unavailable")).toBeNull()
    })

    it("omits the saving and the surcharge rather than announcing zero of either", () => {
        render(
            <_OrderSummary
                state="ready"
                props={{ labels, subtotal: "1,200,000 ₫", total: "1,200,000 ₫" }}
            />,
        )

        expect(rows()).toEqual(["Subtotal1,200,000 ₫"])
        expect(screen.queryByText("Bundle saving")).toBeNull()
        expect(screen.queryByText("Instalment fee (5%)")).toBeNull()
        expect(totalRow()?.textContent).toBe("Total1,200,000 ₫")
    })

    it("draws a saving without a surcharge for an order paid at once", () => {
        render(
            <_OrderSummary
                state="ready"
                props={{
                    labels,
                    subtotal: "2,500,000 ₫",
                    savings: "−250,000 ₫",
                    total: "2,250,000 ₫",
                }}
            />,
        )

        expect(rows()).toEqual(["Subtotal2,500,000 ₫", "Bundle saving−250,000 ₫"])
        expect(screen.queryByText("Instalment fee (5%)")).toBeNull()
    })

    it("rests every figure while the pricing request is still in flight", () => {
        render(<_OrderSummary state="pending" props={{ labels }} />)

        expect(screen.getByText("Subtotal")).toHaveAttribute("data-loading", "false")
        expect(screen.getByText("Total")).toHaveAttribute("data-loading", "false")
        expect(document.querySelectorAll("[data-loading=\"true\"]")).toHaveLength(2)
        expect(screen.queryByText("Price unavailable")).toBeNull()
    })

    it("replaces the figures with the unavailable line when pricing failed, keeping the labels", () => {
        render(
            <_OrderSummary
                state="failed"
                props={{
                    labels,
                    subtotal: "2,500,000 ₫",
                    savings: "−250,000 ₫",
                    surcharge: "112,500 ₫",
                    total: "2,362,500 ₫",
                }}
            />,
        )

        expect(rows()).toEqual([
            "SubtotalPrice unavailable",
            "Bundle savingPrice unavailable",
            "Instalment fee (5%)Price unavailable",
        ])
        expect(totalRow()?.textContent).toBe("TotalPrice unavailable")
        expect(screen.queryByText("2,500,000 ₫")).toBeNull()
        expect(document.querySelector("[data-loading=\"true\"]")).toBeNull()
    })
})
