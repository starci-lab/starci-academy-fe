/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import { _ShellNav, type ShellNavLabels } from "@/components/layouts/ShellNav/component"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: that the bar is a landmark drawn by the registry, that the wordmark is
 * a LINK and the sign-in a BUTTON - the difference between changing the address and opening a
 * surface - and that the overlay is mounted here at all. It used to be mounted nowhere, which
 * meant the only way to sign in was to type the address by hand.
 */

const labels: ShellNavLabels = {
    brand: "StarCi Academy",
    signIn: "Sign in",
}

/** A stand-in for the overlay that normally hangs off the bar. */
const Overlay = () => <dialog data-part="overlay" />

afterEach(() => {
    cleanup()
})

describe("_ShellNav", () => {
    it("draws the shell-nav key, and wears its registry classes rather than any of its own", () => {
        const { container } = render(
            <_ShellNav labels={labels} slots={{ overlay: Overlay }} onOpenSignIn={vi.fn()} />,
        )
        const nav = container.firstElementChild
        expect(nav?.getAttribute("data-node")).toBe("shell-nav")
        expect(nav?.getAttribute("class")).toBe(contractSpec("shell-nav").classes)
    })

    it("renders as the landmark a screen reader jumps to", () => {
        const { container } = render(
            <_ShellNav labels={labels} slots={{ overlay: Overlay }} onOpenSignIn={vi.fn()} />,
        )
        expect(container.firstElementChild?.tagName).toBe("NAV")
    })

    it("takes the reader home through a real address rather than a handler", () => {
        const { container } = render(
            <_ShellNav labels={labels} slots={{ overlay: Overlay }} onOpenSignIn={vi.fn()} />,
        )
        const brand = container.querySelector("a")
        expect(brand?.getAttribute("href")).toBe("/dashboard")
        expect(brand?.textContent).toContain(labels.brand)
    })

    it("opens the sign-in surface from a control that presses rather than navigates", () => {
        const onOpenSignIn = vi.fn()
        const { container } = render(
            <_ShellNav labels={labels} slots={{ overlay: Overlay }} onOpenSignIn={onOpenSignIn} />,
        )
        const signIn = container.querySelector("button")
        expect(signIn?.textContent).toContain(labels.signIn)
        fireEvent.click(signIn as HTMLButtonElement)
        expect(onOpenSignIn).toHaveBeenCalledTimes(1)
    })

    it("mounts the overlay it was handed, beside the controls rather than around them", () => {
        const { container } = render(
            <_ShellNav labels={labels} slots={{ overlay: Overlay }} onOpenSignIn={vi.fn()} />,
        )
        const overlay = container.querySelector("[data-part='overlay']")
        expect(overlay).not.toBeNull()
        expect(overlay?.parentElement?.getAttribute("data-node")).toBe("shell-nav")
    })

    it("rests the control it owns rather than drawing a second bar", () => {
        const { container } = render(
            <_ShellNav labels={labels} slots={{ overlay: Overlay }} onOpenSignIn={vi.fn()} isLoading />,
        )
        expect(container.firstElementChild?.getAttribute("data-node")).toBe("shell-nav")
        expect(container.querySelector("button")?.getAttribute("data-loading")).toBe("true")
    })
})
