/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StatRow } from "."

describe("StatRow", () => {
    it("keeps the identity label and its value on the settled text-sm recipe", () => {
        render(<StatRow hierarchy="peer" props={{ icon: "streak", label: "Streak", value: "7 days" }} />)

        expect(screen.getByText("Streak")).toHaveAttribute("data-size", "sm")
        expect(screen.getByText("7 days")).toHaveAttribute("data-size", "sm")
    })

    it("keeps the loading value on the same text-sm recipe", () => {
        render(<StatRow hierarchy="peer" props={{ icon: "credit", label: "AI credit" }} isLoading />)

        expect(screen.getByText("AI credit")).toHaveAttribute("data-size", "sm")
        expect(document.querySelector("[data-component=\"Text\"][data-loading=\"true\"]"))
            .toHaveAttribute("data-size", "sm")
    })

    it("preserves the label-led recipe for stat rows outside the identity rail", () => {
        render(<StatRow props={{ icon: "cart", label: "Subtotal", value: "$20" }} />)

        expect(screen.getByText("Subtotal")).toHaveAttribute("data-size", "md")
        expect(screen.getByText("$20")).toHaveAttribute("data-size", "xs")
    })
})
