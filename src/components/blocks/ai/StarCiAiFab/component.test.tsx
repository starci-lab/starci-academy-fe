import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { StarCiAiFab } from "./component"

describe("StarCiAiFab", () => {
    it("draws the chatbot identity and emits its single open action", () => {
        const press = vi.fn()
        render(<StarCiAiFab props={{ label: "StarCi AI", isOpen: false, hasUnread: true }} on={{ press }} />)

        const trigger = screen.getByRole("button", { name: "StarCi AI" })
        expect(trigger).toHaveAttribute("aria-expanded", "false")
        expect(trigger.querySelector("[data-component=\"StarCiAiMark\"]")).toBeInTheDocument()
        expect(trigger.querySelector("img")?.getAttribute("src")).toContain("starci-ai-mark-v1.png")
        fireEvent.click(trigger)
        expect(press).toHaveBeenCalledTimes(1)
    })
})
