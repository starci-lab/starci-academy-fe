import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { SignInOverlay } from "."

/**
 * What these tests guard.
 *
 * The connected half resolves exactly one thing: that being signed in is also a way out. The panel
 * reports success, the surface closes, and the bar that opened it never learns why.
 *
 * The panel is MOUNTED only while the surface is open rather than hidden with it, because the panel
 * runs the auth machine and a second copy of every field id must not sit in the document behind a
 * closed surface. And the success callback keeps one identity across re-renders, so a reader part
 * way through a one-time code is not remounted out of it.
 */

const mocks = vi.hoisted(() => ({ signedIn: undefined as (() => void) | undefined, renders: 0 }))

type PanelStub = { readonly initialMode: string, readonly onSignedIn: () => void }

vi.mock("@/components/blocks/auth/AuthenticationPanel", () => ({
    AuthenticationPanel: (input: PanelStub) => {
        mocks.renders += 1
        mocks.signedIn = input.onSignedIn
        return <div data-testid="panel" data-mode={input.initialMode}>Authentication panel</div>
    },
}))

type OverlayStub = {
    readonly isOpen: boolean
    readonly onDismiss: () => void
    readonly render: { readonly kind: string, readonly project?: () => React.ReactNode }
}

vi.mock("./component", () => ({
    _SignInOverlay: (input: OverlayStub) => (
        <section data-testid="surface" data-open={String(input.isOpen)}>
            <button type="button" onClick={input.onDismiss}>Close</button>
            {input.render.project?.()}
        </section>
    ),
}))

beforeEach(() => {
    mocks.signedIn = undefined
    mocks.renders = 0
    vi.clearAllMocks()
})

describe("SignInOverlay", () => {
    it("mounts the panel on the sign-in journey by default", () => {
        render(<SignInOverlay isOpen onDismiss={vi.fn()} />)

        expect(screen.getByTestId("panel")).toHaveAttribute("data-mode", "signIn")
        expect(screen.getByTestId("surface")).toHaveAttribute("data-open", "true")
    })

    it("opens on the journey the bar selected before the surface did", () => {
        render(<SignInOverlay isOpen initialMode="signUp" onDismiss={vi.fn()} />)
        expect(screen.getByTestId("panel")).toHaveAttribute("data-mode", "signUp")
    })

    it("keeps no auth machine in the document behind a closed surface", () => {
        render(<SignInOverlay isOpen={false} onDismiss={vi.fn()} />)

        expect(screen.queryByTestId("panel")).not.toBeInTheDocument()
        expect(screen.getByTestId("surface")).toHaveAttribute("data-open", "false")
    })

    it("treats a successful sign-in as a way out", () => {
        const onDismiss = vi.fn()
        render(<SignInOverlay isOpen onDismiss={onDismiss} />)

        mocks.signedIn?.()
        expect(onDismiss).toHaveBeenCalledOnce()
    })

    it("hands the covering surface's own way out to the bar", () => {
        const onDismiss = vi.fn()
        render(<SignInOverlay isOpen onDismiss={onDismiss} />)

        fireEvent.click(screen.getByRole("button", { name: "Close" }))
        expect(onDismiss).toHaveBeenCalledOnce()
    })

    it("keeps the success callback stable so a half-entered code survives a re-render", () => {
        const first = vi.fn()
        const second = vi.fn()
        const { rerender } = render(<SignInOverlay isOpen onDismiss={first} />)
        const originalCallback = mocks.signedIn

        rerender(<SignInOverlay isOpen onDismiss={second} />)
        expect(mocks.signedIn).toBe(originalCallback)

        mocks.signedIn?.()
        expect(second).toHaveBeenCalledOnce()
        expect(first).not.toHaveBeenCalled()
    })
})
