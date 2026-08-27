import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PricingPhaseDisclosure } from "."

const phases = [
    { id: "pioneer", name: "Pioneer", value: "1,000,000 ₫" },
    { id: "early", name: "Early", value: "Open now", isActive: true },
    { id: "standard", name: "Standard", value: "1,500,000 ₫" },
]

describe("PricingPhaseDisclosure", () => {
    it("uses one native disclosure trigger and reveals every resolved phase", () => {
        render(<PricingPhaseDisclosure props={{ label: "Compare phases", phases }} />)

        const trigger = screen.getByRole("button", { name: "Compare phases" })
        expect(trigger).toHaveAttribute("aria-expanded", "false")

        fireEvent.click(trigger)
        expect(trigger).toHaveAttribute("aria-expanded", "true")
        expect(screen.getByText("Pioneer")).toBeInTheDocument()
        expect(screen.getByText("Early")).toBeInTheDocument()
        expect(screen.getByText("Standard")).toBeInTheDocument()
        expect(screen.getByText("Pioneer")).toHaveAttribute("data-size", "sm")
        expect(screen.getByText("Pioneer")).toHaveAttribute("data-tone", "default")
        expect(screen.getByText("Standard")).toHaveAttribute("data-tone", "default")
        expect(screen.getByText("Early")).toHaveAttribute("data-tone", "accent")
        expect(screen.getByText("Pioneer").closest("ul")).toBeInTheDocument()
        expect(trigger.querySelector("span"))
            .toHaveClass("rotate-90", "text-foreground")
    })

    it("can start open without changing phase cardinality", () => {
        render(<PricingPhaseDisclosure props={{ label: "Compare phases", phases, isOpen: true }} />)
        expect(screen.getByRole("button", { name: "Compare phases" })).toHaveAttribute("aria-expanded", "true")
        expect(screen.getAllByRole("listitem")).toHaveLength(3)
    })
})
