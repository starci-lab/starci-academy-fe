// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Subnav } from "./index.js"

afterEach(cleanup)

describe("Core Subnav", () => {
    it("renders compact identity and toggles the consumer-owned drawer", () => {
        const onMenuOpenChange = vi.fn()
        const { container } = render(
            <Subnav
                label="Course navigation"
                title="Fullstack Mastery"
                leading={<span>Logo</span>}
                menuIcon={<span>Menu</span>}
                openMenuLabel="Open course navigation"
                closeMenuLabel="Close course navigation"
                isMenuOpen={false}
                onMenuOpenChange={onMenuOpenChange}
            />,
        )

        expect(container.querySelector("[data-grammar-subnav='true']")?.getAttribute("data-grammar-subnav-visibility")).toBe("compact")
        expect(container.querySelector("[data-grammar-subnav='true']")?.className).not.toContain("top-16")
        expect(screen.getByText("Fullstack Mastery")).toBeTruthy()
        const trigger = screen.getByRole("button", { name: "Open course navigation" })
        expect(trigger.className).toContain("button--tertiary")
        fireEvent.click(trigger)
        expect(onMenuOpenChange).toHaveBeenCalledWith(true)
    })
})
