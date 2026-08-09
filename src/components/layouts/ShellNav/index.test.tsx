/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import { ShellNav } from "@/components/layouts/ShellNav"

/**
 * What these tests guard: the one fact this half owns - whether the sign-in overlay is on
 * screen. The dialog only reaches the top layer when something opens it, so the test that
 * matters is the round trip: press the control, the surface is open; take the way out, it is
 * closed. Anything less would pass with an overlay that is mounted and unreachable, which is
 * exactly the state this file was written to end.
 */

/** The overlay's own state marker, as the surface publishes it. */
const overlayState = (container: HTMLElement): string | null =>
    container.querySelector("[data-component='SignInOverlay']")?.getAttribute("data-state") ?? null

/** The control that opens the sign-in surface. */
const signInControl = (container: HTMLElement): HTMLButtonElement | undefined =>
    [...container.querySelectorAll("button")].find((button) => button.textContent?.includes("Sign in"))

afterEach(() => {
    cleanup()
})

describe("ShellNav", () => {
    it("draws the bar with the overlay mounted and closed", () => {
        const { container } = render(<ShellNav />)
        expect(container.querySelector("[data-node='shell-nav']")).not.toBeNull()
        expect(overlayState(container)).toBe("closed")
    })

    it("opens the sign-in surface when the control is pressed", () => {
        const { container } = render(<ShellNav />)
        fireEvent.click(signInControl(container) as HTMLButtonElement)
        expect(overlayState(container)).toBe("open")
    })

    it("closes it again through the way out the surface owns", () => {
        const { container } = render(<ShellNav />)
        fireEvent.click(signInControl(container) as HTMLButtonElement)
        const close = [...container.querySelectorAll("button")]
            .find((button) => button.textContent?.includes("Close"))
        fireEvent.click(close as HTMLButtonElement)
        expect(overlayState(container)).toBe("closed")
    })

    it("names the product once, and sends the wordmark home", () => {
        const { container } = render(<ShellNav />)
        const brand = container.querySelector("a")
        expect(brand?.textContent).toContain("StarCi Academy")
        expect(brand?.getAttribute("href")).toBe("/dashboard")
    })
})
