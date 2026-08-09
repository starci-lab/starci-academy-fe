/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { Badge, meta, type BadgeProps, type BadgeTone } from "@/components/atoms/Badge"

/**
 * What these tests are really guarding: that the tone is a MEANING and stays readable as one. The
 * failure that matters is two tones collapsing onto the same appearance - the moment "warning" and
 * "danger" look alike, the badge has stopped classifying anything and is just decoration.
 */

/** Fractional Tailwind spacing (gap-1.5, p-2.5) is off the house scale. */
const FRACTIONAL_SPACING = /\b[a-z-]+-\d+\.5\b/

/** An arbitrary Tailwind value escapes the token system entirely. */
const ARBITRARY_VALUE = /-\[[^\]]+\]/

/** The whole tone vocabulary, mirrored so a loop can walk it. */
const TONES: ReadonlyArray<BadgeTone> = ["neutral", "accent", "success", "warning", "danger"]

/** Render one tone and hand back its root element. */
const renderBadge = (tone?: BadgeTone, isLoading?: boolean): Element => {
    const { container } = render(
        <Badge tone={tone} isLoading={isLoading}>
            Draft
        </Badge>,
    )
    const root = container.firstElementChild
    if (!root) throw new Error("Badge rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("Badge", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "atom", name: "Badge" })
    })

    it("renders inline, so it can sit on the baseline of the line it annotates", () => {
        expect(renderBadge().tagName).toBe("SPAN")
    })

    it("defaults to the tone that claims nothing", () => {
        expect(renderBadge().getAttribute("data-tone")).toBe("neutral")
    })

    it("badges itself so a gate can read the tier off the rendered node", () => {
        const root = renderBadge("danger")
        expect(root.getAttribute("data-tier")).toBe("atom")
        expect(root.getAttribute("data-component")).toBe("Badge")
        expect(root.getAttribute("data-tone")).toBe("danger")
        expect(root.getAttribute("data-loading")).toBe("false")
    })

    it("publishes the meaning, not the colour, for anything reading the DOM", () => {
        for (const tone of TONES) {
            expect(renderBadge(tone).getAttribute("data-tone"), tone).toBe(tone)
            cleanup()
        }
    })

    it("renders the resolved label it was handed", () => {
        expect(renderBadge().textContent).toBe("Draft")
    })

    it("draws every tone differently, so no two meanings look alike", () => {
        const drawn = new Set<string>()
        for (const tone of TONES) {
            drawn.add(renderBadge(tone).getAttribute("class") ?? "")
            cleanup()
        }
        expect(drawn.size).toBe(TONES.length)
    })

    it("keeps every class it draws on the house scale", () => {
        for (const tone of TONES) {
            for (const isLoading of [false, true]) {
                const classes = renderBadge(tone, isLoading).getAttribute("class") ?? ""
                const label = `${tone}/${isLoading}`
                expect(classes.trim(), label).not.toBe("")
                expect(FRACTIONAL_SPACING.test(classes), label).toBe(false)
                expect(ARBITRARY_VALUE.test(classes), label).toBe(false)
                cleanup()
            }
        }
    })

    it("never paints a margin of its own, because the node above owns every gap", () => {
        for (const tone of TONES) {
            const classes = renderBadge(tone).getAttribute("class") ?? ""
            for (const token of classes.split(/\s+/)) {
                expect(/^-?m[trblxy]?-/.test(token), token).toBe(false)
            }
            cleanup()
        }
    })

    it("rests as itself rather than as a second shape", () => {
        const root = renderBadge("success", true)
        expect(root.tagName).toBe("SPAN")
        expect(root.getAttribute("data-loading")).toBe("true")
        expect(root.getAttribute("aria-hidden")).toBe("true")
        expect(root.getAttribute("class")).toContain("skeleton")
        expect(root.textContent).toBe("Draft")
    })

    it("offers no className or style back door", () => {
        const backDoor = { className: "back-door", style: { color: "red" } } as unknown as BadgeProps
        const { container } = render(<Badge {...backDoor}>Draft</Badge>)
        const root = container.firstElementChild
        expect(root?.getAttribute("class") ?? "").not.toContain("back-door")
        expect(root?.getAttribute("style")).toBe(null)
    })
})
