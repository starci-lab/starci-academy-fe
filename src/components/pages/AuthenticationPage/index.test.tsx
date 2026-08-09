/** @vitest-environment jsdom */
import { useEffect } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import type { ContractSlot } from "@/components/contracts"
import { AuthenticationPage } from "@/components/pages/AuthenticationPage"

/**
 * What these tests guard: that the page holds the panel still, and hands it nothing.
 *
 * It builds the slot once, so a re-render of the route cannot restart a challenge the reader is
 * part way through answering. It hands the panel no completion callback, because where a reader
 * should land after signing in is a fact about where they came FROM and this page has not been
 * told. And it hands the panel no title-line slot, which is the whole difference between the
 * routed surface and the floating one: a page that is already the screen has no way out to draw.
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
        useEffect(() => {
            leaves.mounts += 1
        }, [])
        return <p data-part="panel">Panel</p>
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

describe("AuthenticationPage", () => {
    it("renders the panel", () => {
        const { container } = render(<AuthenticationPage />)
        expect(container.querySelector("[data-part='panel']")?.textContent).toBe("Panel")
    })

    it("draws the panel bare - the route is the surface, so nothing floats above it", () => {
        const { container } = render(<AuthenticationPage />)
        expect(container.querySelector("dialog")).toBeNull()
    })

    it("hands the panel no way out, because a full-screen route has none", () => {
        render(<AuthenticationPage />)
        expect(leaves.action).toBeUndefined()
    })

    it("builds the panel once, however often the route re-renders", () => {
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
