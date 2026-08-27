import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PressableSurface } from "."

describe("PressableSurface", () => {
    it("exposes an accessible press target and forwards activation", () => {
        const press = vi.fn()
        render(<PressableSurface label="Open profile" press={press}><span>Profile</span></PressableSurface>)
        fireEvent.click(screen.getByRole("button", { name: "Open profile" }))
        expect(press).toHaveBeenCalledOnce()
        expect(screen.getByText("Profile")).toBeInTheDocument()
    })
    it("supports disabled interaction", () => {
        const press = vi.fn()
        render(<PressableSurface label="Open profile" press={press} disabled><span>Profile</span></PressableSurface>)
        expect(screen.getByRole("button", { name: "Open profile" })).toBeDisabled()
    })
})
