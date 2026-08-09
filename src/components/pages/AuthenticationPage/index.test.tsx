/** @vitest-environment jsdom */
import { useEffect } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { AuthenticationPage } from "@/components/pages/AuthenticationPage"

/**
 * What these tests guard: that the page holds the flow still. It builds the slot once, so a
 * re-render of the route cannot restart a challenge the reader is part way through answering,
 * and it hands the flow no completion callback - where a reader should land after signing in
 * is a fact about where they came FROM, which this page has not been told.
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

describe("AuthenticationPage", () => {
    it("titles the page from its own copy", () => {
        const { container } = render(<AuthenticationPage />)
        expect(container.querySelector("h1")?.textContent).toBe("Sign in")
    })

    it("renders the flow inside the page body", () => {
        const { container } = render(<AuthenticationPage />)
        const section = container.querySelector("[data-node='section']")
        expect(section?.querySelector("[data-part='flow']")).not.toBeNull()
    })

    it("draws the flow bare - the route is the surface, so nothing floats above it", () => {
        const { container } = render(<AuthenticationPage />)
        expect(container.querySelector("dialog")).toBeNull()
    })

    it("builds the flow once, however often the route re-renders", () => {
        const { rerender } = render(<AuthenticationPage />)
        rerender(<AuthenticationPage />)
        rerender(<AuthenticationPage />)
        expect(leaves.mounts).toBe(1)
    })

    it("does not decide where a reader lands after signing in", () => {
        render(<AuthenticationPage />)
        expect(leaves.signedIn).toBeUndefined()
    })
})
