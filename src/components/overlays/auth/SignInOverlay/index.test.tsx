/** @vitest-environment jsdom */
import { useEffect } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import { SignInOverlay } from "@/components/overlays/auth/SignInOverlay"

/**
 * What these tests guard: that signing in is also a way OUT, and that the slot holding the
 * flow is built exactly once.
 *
 * The second is the one that looks like a detail and is not. The registry frame mounts a slot
 * as a component, so a slot whose identity changes between renders is remounted - and
 * remounting this one throws away a challenge the reader is part way through answering. A
 * caller that re-renders with a fresh handler on every keystroke of its own must not be able
 * to cause that.
 */

const leaves = vi.hoisted(() => ({
    signedIn: undefined as (() => void) | undefined,
    mounts: 0,
}))

/** The single prop the stand-in flow is handed. */
interface FlowStubProps {
    /** Called by the flow once a token is in hand. */
    onSignedIn?: () => void
}

vi.mock("@/components/overlays/auth/SignInFlow", () => ({
    SignInFlow: ({ onSignedIn }: FlowStubProps) => {
        leaves.signedIn = onSignedIn
        // Counted on MOUNT, not on render: a re-render is fine and expected, while a remount
        // is what would throw away a challenge the reader is part way through answering.
        useEffect(() => {
            leaves.mounts += 1
        }, [])
        return <p data-part="flow">Flow</p>
    },
}))

beforeEach(() => {
    leaves.signedIn = undefined
    leaves.mounts = 0
})

afterEach(() => {
    cleanup()
})

describe("SignInOverlay", () => {
    it("hangs the flow inside the dialog", () => {
        const { container } = render(<SignInOverlay isOpen onDismiss={vi.fn()} />)
        expect(container.querySelector("dialog")?.querySelector("[data-part='flow']")).not.toBeNull()
    })

    it("names the surface and its way out", () => {
        const { container } = render(<SignInOverlay isOpen onDismiss={vi.fn()} />)
        const titleId = container.querySelector("dialog")?.getAttribute("aria-labelledby")
        expect(container.querySelector(`#${titleId}`)?.textContent).toBe("Sign in")
        expect([...container.querySelectorAll("button")].map((button) => button.textContent))
            .toContain("Close")
    })

    it("treats a successful sign-in as a way out", () => {
        const onDismiss = vi.fn()
        render(<SignInOverlay isOpen onDismiss={onDismiss} />)
        leaves.signedIn?.()
        expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it("sends the close control to the same callback", () => {
        const onDismiss = vi.fn()
        const { container } = render(<SignInOverlay isOpen onDismiss={onDismiss} />)
        const close = [...container.querySelectorAll("button")]
            .find((button) => button.textContent === "Close")
        fireEvent.click(close as HTMLButtonElement)
        expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it("does not remount the flow when the caller re-renders with a new handler", () => {
        const { rerender } = render(<SignInOverlay isOpen onDismiss={vi.fn()} />)
        expect(leaves.mounts).toBe(1)
        rerender(<SignInOverlay isOpen onDismiss={vi.fn()} />)
        rerender(<SignInOverlay isOpen onDismiss={vi.fn()} />)
        expect(leaves.mounts).toBe(1)
    })

    it("still reaches the handler the caller passed most recently", () => {
        const first = vi.fn()
        const second = vi.fn()
        const { rerender } = render(<SignInOverlay isOpen onDismiss={first} />)
        rerender(<SignInOverlay isOpen onDismiss={second} />)
        leaves.signedIn?.()
        expect(first).not.toHaveBeenCalled()
        expect(second).toHaveBeenCalledTimes(1)
    })

    it("follows the open flag", () => {
        const { container, rerender } = render(<SignInOverlay isOpen onDismiss={vi.fn()} />)
        expect(container.querySelector("dialog")?.hasAttribute("open")).toBe(true)
        rerender(<SignInOverlay isOpen={false} onDismiss={vi.fn()} />)
        expect(container.querySelector("dialog")?.hasAttribute("open")).toBe(false)
    })
})
