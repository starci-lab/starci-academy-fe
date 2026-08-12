/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
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
})
