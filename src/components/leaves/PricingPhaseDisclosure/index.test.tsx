import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PricingPhaseDisclosure } from "."

const phases = [
    { id: "pioneer", name: "Pioneer", value: "1,000,000 ₫" },
    { id: "early", name: "Early", value: "Open now", isActive: true },
    { id: "standard", name: "Standard", value: "1,500,000 ₫" },
]

describe("PricingPhaseDisclosure", () => {
    it("uses one native disclosure and reveals every resolved phase", () => {
        render(<PricingPhaseDisclosure props={{ label: "Compare phases", phases }} />)

        const disclosure = screen.getByText("Compare phases").closest("details")
        expect(disclosure).not.toHaveAttribute("open")
        expect(disclosure?.querySelectorAll("li")).toHaveLength(3)

        fireEvent.click(screen.getByText("Compare phases"))
        expect(disclosure).toHaveAttribute("open")
        expect(screen.getByText("Pioneer")).toBeInTheDocument()
        expect(screen.getByText("Early")).toBeInTheDocument()
        expect(screen.getByText("Standard")).toBeInTheDocument()
    })

    it("can start open without changing phase cardinality", () => {
        render(<PricingPhaseDisclosure props={{ label: "Compare phases", phases, isOpen: true }} />)
        expect(screen.getByText("Compare phases").closest("details")).toHaveAttribute("open")
        expect(screen.getAllByRole("listitem")).toHaveLength(3)
    })
})
