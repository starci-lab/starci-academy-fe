/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { TextLink } from "./index"

afterEach(cleanup)

describe("TextLink", () => {
    it("uses the small reading step when it completes a small-text sentence", () => {
        render(<TextLink props={{ label: "Sign up", size: "sm" }} />)

        const link = screen.getByRole("link", { name: "Sign up" })
        expect(link.className).toContain("text-sm")
        expect(link.getAttribute("data-size")).toBe("sm")
    })

    it("keeps selected and unselected peer choices on the same reading step", () => {
        const { rerender } = render(<TextLink props={{ label: "2026", size: "sm", isSelected: true }} />)
        const link = screen.getByRole("link", { name: "2026" })
        expect(link).toHaveAttribute("data-selected", "true")
        expect(link.className).toContain("text-sm")
        expect(link.className).toContain("px-2")

        rerender(<TextLink props={{ label: "2026", size: "sm", isSelected: false }} />)
        expect(link).toHaveAttribute("data-selected", "false")
        expect(link.className).toContain("text-sm")
        expect(link.className).toContain("px-2")
    })

    it("keeps pending feedback inside the action and refuses a duplicate press", () => {
        const press = vi.fn()
        const { container } = render(
            <TextLink props={{ label: "Send again", size: "sm", isPending: true }} on={{ press }} />,
        )

        const link = screen.getByRole("link", { name: "Send again" })
        expect(link).toHaveAttribute("aria-disabled", "true")
        expect(link).toHaveAttribute("data-action-pending", "true")
        expect(container.querySelector("[data-slot='spinner']")).toBeTruthy()
        fireEvent.click(link)
        expect(press).not.toHaveBeenCalled()
    })

    it("refuses a press sequence captured before the action rendered pending", () => {
        const press = vi.fn()
        const { rerender } = render(
            <TextLink props={{ label: "Send again", size: "sm" }} on={{ press }} />,
        )
        const link = screen.getByRole("link", { name: "Send again" })
        fireEvent.click(link)
        expect(press).toHaveBeenCalledTimes(1)

        rerender(
            <TextLink props={{ label: "Send again", size: "sm", isPending: true }} on={{ press }} />,
        )
        fireEvent.click(link)

        expect(press).toHaveBeenCalledTimes(1)
    })

    it("locks synchronously before owner pending can commit", () => {
        vi.useFakeTimers()
        const press = vi.fn()
        render(<TextLink props={{ label: "Send again", size: "sm" }} on={{ press }} />)
        const link = screen.getByRole("link", { name: "Send again" })

        fireEvent.click(link)
        fireEvent.click(link)
        expect(press).toHaveBeenCalledTimes(1)

        vi.advanceTimersByTime(300)
        fireEvent.click(link)
        expect(press).toHaveBeenCalledTimes(2)
        vi.useRealTimers()
    })
})
