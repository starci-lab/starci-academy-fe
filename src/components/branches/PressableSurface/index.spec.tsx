import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PressableSurface } from "."

describe("PressableSurface", () => {
    it("uses a real link when a resolved destination is available", () => {
        const courseHref = "/courses/fullstack"
        render(<PressableSurface label="Open course" href={courseHref}><span>Fullstack</span></PressableSurface>)

        expect(screen.getByRole("link", { name: "Open course" })).toHaveAttribute("href", "/courses/fullstack")
        expect(screen.queryByRole("button", { name: "Open course" })).toBeNull()
    })

    it("exposes an accessible press target and forwards activation", () => {
        const press = vi.fn()
        render(<PressableSurface label="Open profile" press={press}><span>Profile</span></PressableSurface>)
        fireEvent.click(screen.getByRole("button", { name: "Open profile" }))
        expect(press).toHaveBeenCalledOnce()
        expect(screen.getByText("Profile")).toBeInTheDocument()
    })
    it("maps feedback to semantic action scope instead of title presence", () => {
        const { rerender } = render(<PressableSurface label="Open profile" press={() => undefined} hover="surface"><span>Profile</span></PressableSurface>)
        expect(screen.getByRole("button", { name: "Open profile" })).toHaveAttribute("data-interaction-scope", "whole-action")
        expect(screen.getByRole("button", { name: "Open profile" })).toHaveClass("hover:bg-accent-soft", "focus-visible:bg-accent-soft", "active:bg-accent-soft/80")

        rerender(<PressableSurface label="Open details" press={() => undefined} hover="label"><span>Details</span></PressableSurface>)
        expect(screen.getByRole("button", { name: "Open details" })).toHaveAttribute("data-interaction-scope", "inline-action")
        expect(screen.getByRole("button", { name: "Open details" })).not.toHaveClass("hover:bg-accent-soft")
    })
    it("supports disabled interaction", () => {
        const press = vi.fn()
        render(<PressableSurface label="Open profile" press={press} disabled><span>Profile</span></PressableSurface>)
        expect(screen.getByRole("button", { name: "Open profile" })).toBeDisabled()
    })
})
