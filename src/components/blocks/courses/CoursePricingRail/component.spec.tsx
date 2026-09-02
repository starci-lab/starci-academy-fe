import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CoursePricingRailBase } from "./component"

describe("CoursePricingRailBase", () => {
    it("groups price and savings evidence at compact rhythm", () => {
        render(<CoursePricingRailBase state="ready" props={{ title: "React", price: "$10", originalPrice: "$12", savingsLabel: "Save $2", priceDetailLabel: "Why this price?", ctaLabel: "Enroll" }} />)

        const evidence = screen.getByText("$10").parentElement?.parentElement
        expect(evidence).toHaveClass("flex-col", "gap-2")
        expect(evidence).toContainElement(screen.getByText("Save $2"))
        expect(evidence).toContainElement(screen.getByRole("button", { name: "Why this price?" }))
        expect(screen.getByRole("button", { name: "Enroll" })).toBeInTheDocument()
    })

    it("keeps phase comparison outside the primary purchase card", () => {
        render(<CoursePricingRailBase state="ready" props={{ title: "React", price: "$10", ctaLabel: "Enroll", enrolmentLabel: "20 enrolled", phases: [{ id: "early", name: "Early", value: "Open now", isActive: true }, { id: "standard", name: "Standard", value: "$12" }] }} />)

        const primaryCard = screen.getByText("$10").closest(".starci-core-surface")
        const comparisonHeading = screen.getByRole("heading", { name: "React" })
        const comparisonCard = screen.getByText("Open now").closest(".starci-core-surface")
        const peerStack = primaryCard?.closest(".gap-6")
        expect(primaryCard).not.toContainElement(comparisonHeading)
        expect(primaryCard).toContainElement(screen.getByText("20 enrolled"))
        expect(comparisonCard).toContainElement(screen.getByText("Open now"))
        expect(peerStack).toContainElement(comparisonHeading)
        expect(screen.queryByRole("button", { name: "React" })).not.toBeInTheDocument()
    })
})
