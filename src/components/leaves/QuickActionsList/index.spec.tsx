/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { QuickActionsList } from "."

describe("QuickActionsList", () => {
    it("keeps activation on the ListBox while reusing the generic visual row", () => {
        const activate = vi.fn()
        render(<QuickActionsList props={{ label: "Quick", items: [{ id: "course", label: "Browse", icon: "course" }] }} on={{ activate }} />)
        const option = screen.getByRole("option", { name: "Browse" })
        fireEvent.click(option)
        expect(activate).toHaveBeenCalledWith("course")
        expect(option).toHaveTextContent("Browse")
    })
})
