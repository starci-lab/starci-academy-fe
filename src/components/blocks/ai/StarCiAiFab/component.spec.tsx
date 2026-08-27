import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { StarCiAiFab } from "./component"

describe("StarCiAiFab", () => {
    it("draws the chatbot identity and emits its single open action", () => {
        const press = vi.fn()
        render(<StarCiAiFab props={{ label: "StarCi AI", isOpen: false, hasUnread: true }} on={{ press }} />)

        const trigger = screen.getByRole("button", { name: "StarCi AI" })
        expect(trigger).toHaveAttribute("aria-expanded", "false")
        expect(trigger.querySelector("img")).toBeInTheDocument()
        expect(trigger.querySelector("img")?.getAttribute("src")).toContain("starci-ai-mark-v1.png")
        fireEvent.click(trigger)
        expect(press).toHaveBeenCalledTimes(1)
    })

    it("badges the trigger only while something is waiting to be read", () => {
        const unread = render(<StarCiAiFab props={{ label: "StarCi AI", isOpen: false, hasUnread: true }} />)
        const flagged = screen.getByRole("button", { name: "StarCi AI" })
        expect(flagged).toHaveAttribute("data-unread", "true")
        expect(flagged.querySelector("[data-slot=\"chip\"]")?.textContent).toBe("1")
        unread.unmount()

        render(<StarCiAiFab props={{ label: "StarCi AI", isOpen: false, hasUnread: false }} />)
        const quiet = screen.getByRole("button", { name: "StarCi AI" })
        expect(quiet).toHaveAttribute("data-unread", "false")
        expect(quiet.querySelector("[data-slot=\"chip\"]")).toBeNull()
    })

    it("reads the trigger as expanded while the chat it opens is on screen", () => {
        render(<StarCiAiFab props={{ label: "StarCi AI", isOpen: true }} />)
        const trigger = screen.getByRole("button", { name: "StarCi AI" })
        expect(trigger).toHaveAttribute("aria-expanded", "true")
        expect(trigger).toHaveAttribute("data-unread", "false")
    })

    it("rests the mark and the name while the chat's own state is in flight", () => {
        render(<StarCiAiFab props={{ label: "StarCi AI", isOpen: false }} isLoading />)
        const trigger = screen.getByRole("button", { name: "StarCi AI" })
        expect(trigger.querySelector("[data-loading=\"true\"]")).toBeInTheDocument()
        expect(trigger.textContent).not.toContain("StarCi AI")
    })
})
