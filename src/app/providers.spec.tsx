/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { useTranslations } from "next-intl"
import { AppProviders } from "@/app/providers"

/**
 * What this test guards: that the three contexts are mounted and add no node of their own. A
 * provider that rendered a wrapper would put an extra element around the page, directly under
 * `<body>` - the one place nothing is allowed to appear by accident.
 *
 * The second thing it guards is that the message catalogue actually reaches a component. A
 * provider that mounted but resolved nothing would leave every screen rendering its own keys,
 * and every one of those reads as a bug in the component rather than in the wiring.
 */

const MESSAGES = { shell: { brand: "StarCi Academy" } }

/** A stand-in that does what every real block does: ask the catalogue for a string. */
const Reader = () => {
    const t = useTranslations("shell")
    return <p data-part="routed">{t("brand")}</p>
}

afterEach(() => {
    cleanup()
})

describe("AppProviders", () => {
    it("renders the tree beneath it untouched", () => {
        const { container } = render(
            <AppProviders locale="en" messages={MESSAGES}>
                <p data-part="routed">Routed</p>
            </AppProviders>,
        )
        expect(container.querySelector("[data-part='routed']")?.textContent).toBe("Routed")
    })

    it("wraps what it mounts in no provider-owned element", () => {
        const { container } = render(
            <AppProviders locale="en" messages={MESSAGES}>
                <p data-part="routed">Routed</p>
            </AppProviders>,
        )
        const tags = [...container.children].map((node) => node.tagName)
        expect(tags).toEqual(["P"])
        expect(container.querySelector("p")?.getAttribute("data-part")).toBe("routed")
    })

    it("resolves a message for the tree beneath it", () => {
        const { container } = render(
            <AppProviders locale="en" messages={MESSAGES}>
                <Reader />
            </AppProviders>,
        )
        expect(container.querySelector("[data-part='routed']")?.textContent).toBe("StarCi Academy")
    })
})
