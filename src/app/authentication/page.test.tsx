/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import AuthenticationRoute from "./page"

/**
 * What these tests guard: that the route stays a mounting point. Every decision about what signing
 * in IS belongs one tier down, where it can be rendered and tested without a router - so the only
 * thing worth asserting here is that this file adds nothing.
 *
 * The panel is mocked rather than mounted, because mounting it would fire the auth machine and
 * assert nothing about the route.
 */

vi.mock("@/components/blocks/auth/AuthenticationPanel", () => ({
    AuthenticationPanel: () => <p data-part="panel">Authentication</p>,
}))

afterEach(() => {
    cleanup()
})

describe("AuthenticationRoute", () => {
    it("mounts the panel", () => {
        const { container } = render(<AuthenticationRoute />)
        expect(container.querySelector("[data-part='panel']")?.textContent).toBe("Authentication")
    })

    it("adds no markup of its own around it", () => {
        const { container } = render(<AuthenticationRoute />)
        expect(container.children.length).toBe(1)
        expect(container.firstElementChild?.tagName).toBe("P")
    })
})
