/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { IconLabelFactRow } from "."

describe("IconLabelFactRow", () => {
    it("keeps peer label and fact at the same reading size", () => {
        render(<IconLabelFactRow props={{ icon: "streak", label: "Streak", endText: "7 days", recipe: "peer" }} />)
        expect(screen.getByText("Streak")).toHaveAttribute("data-size", "sm")
        expect(screen.getByText("7 days")).toHaveAttribute("data-size", "sm")
    })

    it("keeps label-led facts subordinate", () => {
        render(<IconLabelFactRow props={{ icon: "cart", label: "Subtotal", endText: "$20", recipe: "label-led" }} />)
        expect(screen.getByText("Subtotal")).toHaveAttribute("data-size", "md")
        expect(screen.getByText("$20")).toHaveAttribute("data-size", "xs")
    })

    it("renders compact action copy with optional parent emphasis and no invented fact", () => {
        const { container } = render(<IconLabelFactRow props={{ icon: "course", label: "Browse", recipe: "compact-action" }} />)
        expect(screen.getByText("Browse")).toHaveAttribute("data-size", "sm")
        expect(screen.getByText("Browse")).toHaveAttribute("data-parent-emphasis", "accent-soft")
        expect(container).toHaveTextContent("Browse")
    })
})
