/** @vitest-environment jsdom */
import { useEffect } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import type { ContractSlot } from "@/components/contracts"
import { SignInOverlay } from "@/components/overlays/auth/SignInOverlay"

/**
 * What these tests guard: that signing in is also a way OUT, that the close control lands ON the
 * panel's title line rather than beside it, and that the slot holding the panel is built exactly
 * once.
 *
 * The last is the one that looks like a detail and is not. A slot whose identity changes between
 * renders is remounted - and remounting this one throws away a challenge the reader is part way
 * through answering. A caller that re-renders with a fresh handler on every keystroke of its own
 * must not be able to cause that.
 */

const leaves = vi.hoisted(() => ({
    signedIn: undefined as (() => void) | undefined,
    action: undefined as unknown,
    mounts: 0,
}))

/** What the stand-in panel records rather than drawing. */
interface PanelStubProps {
    /** Called by the panel once a token is in hand. */
    onSignedIn?: () => void
    /** What the host hung on the title line. */
    slots?: { action?: ContractSlot }
}

vi.mock("@/components/blocks/auth/AuthenticationPanel", () => ({
    AuthenticationPanel: ({ onSignedIn, slots }: PanelStubProps) => {
        leaves.signedIn = onSignedIn
        leaves.action = slots?.action
        // Counted on MOUNT, not on render: a re-render is fine and expected, while a remount is
        // what would throw away a challenge the reader is part way through answering.
        useEffect(() => {
            leaves.mounts += 1
        }, [])
        const Action = slots?.action
        return (
            <p data-part="panel">
                Panel
                {Action === undefined ? null : <Action />}
            </p>
        )
    },
}))

beforeEach(() => {
    leaves.signedIn = undefined
    leaves.action = undefined
    leaves.mounts = 0
})

afterEach(() => {
    cleanup()
})

describe("SignInOverlay", () => {
    it("hangs the panel inside the dialog", () => {
        const { container } = render(<SignInOverlay isOpen onDismiss={vi.fn()} />)
        expect(container.querySelector("dialog")?.querySelector("[data-part='panel']")).not.toBeNull()
    })

    it("hands its way out to the panel rather than drawing it beside the panel", () => {
        const { container } = render(<SignInOverlay isOpen onDismiss={vi.fn()} />)
        expect(leaves.action).toBeDefined()
        expect(container.querySelector("[data-part='panel']")?.textContent).toContain("Close")
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

    it("does not remount the panel when the caller re-renders with a new handler", () => {
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

    it("routes a late press of the close control to the newest handler too", () => {
        const first = vi.fn()
        const second = vi.fn()
        const { container, rerender } = render(<SignInOverlay isOpen onDismiss={first} />)
        rerender(<SignInOverlay isOpen onDismiss={second} />)
        const close = [...container.querySelectorAll("button")]
            .find((button) => button.textContent === "Close")
        fireEvent.click(close as HTMLButtonElement)
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
