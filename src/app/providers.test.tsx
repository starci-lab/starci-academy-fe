/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { AppProviders } from "@/app/providers"

/**
 * What this test guards: that the vendor's context is mounted and adds no node of its own. A
 * provider that rendered a wrapper would put an element in the tree that no registry key
 * describes, directly under `<body>` - the one place nothing is allowed to appear by accident.
 */

afterEach(() => {
    cleanup()
})

describe("AppProviders", () => {
    it("renders the tree beneath it untouched", () => {
        const { container } = render(
            <AppProviders>
                <p data-part="routed">Routed</p>
            </AppProviders>,
        )
        expect(container.querySelector("[data-part='routed']")?.textContent).toBe("Routed")
    })

    it("adds no element of its own around what it mounts", () => {
        const { container } = render(
            <AppProviders>
                <p data-part="routed">Routed</p>
            </AppProviders>,
        )
        expect(container.firstElementChild?.getAttribute("data-part")).toBe("routed")
    })
})
