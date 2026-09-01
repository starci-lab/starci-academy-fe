import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { StarCiAiFab } from "./component"

describe("StarCiAiFab", () => {
    it("draws the chatbot identity and emits its single open action", () => {
        const press = vi.fn()
        render(<StarCiAiFab props={{ label: "StarCi AI", isOpen: false, hasUnread: true }} on={{ press }} />)

        const trigger = screen.getByRole("button", { name: "StarCi AI" })
        expect(trigger).toHaveAttribute("aria-expanded", "false")
        expect(trigger).toHaveAttribute("draggable", "false")
        expect(trigger).toHaveAttribute("data-slot", "starci-ai-mascot")
        const boundary = document.querySelector("[data-slot=\"starci-ai-drag-boundary\"]")
        expect(boundary).toHaveClass(
            "fixed",
            "left-4",
            "right-4",
            "top-32",
            "bottom-20",
            "lg:bottom-4",
            "max-lg:[[data-ai-clearance=dashboard]_&]:top-40",
            "max-lg:[[data-ai-clearance=profile]_&]:top-40",
        )
        expect(boundary).not.toHaveClass(
            "[[data-ai-clearance=dashboard]_&]:left-[calc(100vw-4.25rem)]",
            "[[data-ai-clearance=profile]_&]:left-[calc(100vw-3.75rem)]",
            "[[data-ai-clearance=profile]_&]:bottom-[calc(100dvh-3.75rem)]",
            "max-lg:[[data-ai-clearance=profile]_&]:hidden",
        )
        expect(trigger).toHaveClass("bottom-0")
        expect(trigger).not.toHaveClass("bottom-20")
        expect(trigger.querySelector("img")).toBeInTheDocument()
        expect(trigger.querySelector("img")?.getAttribute("src")).toContain("starci-ai-teacher-v1.png")
        expect(trigger.querySelector("[data-slot=\"starci-ai-teacher\"]")).toHaveClass("rounded-full")
        expect(trigger.querySelector("[data-slot=\"starci-ai-drag-handle-art\"]")).toHaveClass("pointer-events-none")
        expect(trigger.querySelector("[data-slot=\"starci-ai-drag-handle-art\"]")).toHaveAttribute("aria-hidden", "true")
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

    it("restores the safe drag origin when viewport geometry changes", async () => {
        render(<StarCiAiFab props={{ label: "StarCi AI", isOpen: false }} />)
        expect(screen.getByRole("button", { name: "StarCi AI" })).toHaveAttribute("data-drag-frame", "0")

        fireEvent(window, new Event("resize"))

        await waitFor(() => expect(screen.getByRole("button", { name: "StarCi AI" })).toHaveAttribute("data-drag-frame", "1"))
        expect(screen.getByRole("button", { name: "StarCi AI" })).toHaveClass("bottom-0")
    })
})
