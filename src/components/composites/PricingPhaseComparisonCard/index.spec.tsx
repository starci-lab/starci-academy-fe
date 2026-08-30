import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PricingPhaseComparisonCard } from "."

const phases = [
    { id: "pioneer", name: "Pioneer", value: "1,000,000 ₫" },
    { id: "early", name: "Early", value: "Open now", isActive: true },
    { id: "standard", name: "Standard", value: "1,500,000 ₫" },
]

describe("PricingPhaseComparisonCard", () => {
    it("keeps every short comparison visible in one static surface", () => {
        render(<PricingPhaseComparisonCard props={{ label: "Compare phases", phases }} />)

        const heading = screen.getByRole("heading", { name: "Compare phases" })
        const list = screen.getByRole("list", { name: "Compare phases" })
        expect(heading).toBeInTheDocument()
        expect(heading.closest("[data-slot='card']")).toBeNull()
        expect(list.closest("[data-slot='card']")).toBeInTheDocument()
        expect(heading.parentElement?.nextElementSibling).toBe(list.closest("[data-slot='card']"))
        expect(screen.queryByRole("button", { name: "Compare phases" })).not.toBeInTheDocument()
        expect(screen.getAllByRole("listitem")).toHaveLength(3)
        expect(screen.getByText("Pioneer").closest("ol")).toHaveClass("relative", "flex", "gap-3")
        expect(screen.getByText("Pioneer").closest("li")?.querySelector("span[aria-hidden='true']")).toHaveClass("bg-muted")
        expect(screen.getByText("Early").closest("li")).toHaveAttribute("data-current-phase", "true")
        expect(screen.getByText("Early").closest("li")?.querySelector("span[aria-hidden='true']")).toHaveClass("bg-accent")
        expect(screen.getByText("Open now")).toHaveAttribute("data-tone", "accent")
        expect(screen.getByText("Standard").closest("[data-slot='card']")).toBeInTheDocument()
    })
})
