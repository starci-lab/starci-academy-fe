/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { Text, meta, type TextProps, type TextSize, type TextTone } from "@/components/atoms/Text"

/**
 * What these tests are really guarding: that `body` and `meta` stay one component with two tones
 * rather than drifting into two components. If the tones ever render the same classes, the
 * distinction has quietly stopped existing and every "supporting fact" on the site is shouting
 * as loudly as the content it supports.
 */

/** Fractional Tailwind spacing (gap-1.5, p-2.5) is off the house scale. */
const FRACTIONAL_SPACING = /\b[a-z-]+-\d+\.5\b/

/** An arbitrary Tailwind value escapes the token system entirely. */
const ARBITRARY_VALUE = /-\[[^\]]+\]/

/** The whole tone vocabulary, mirrored so a loop can walk it. */
const TONES: ReadonlyArray<TextTone> = ["default", "muted"]

/** The whole size vocabulary, mirrored so a loop can walk it. */
const SIZES: ReadonlyArray<TextSize> = ["sm", "md"]

/** Render one combination and hand back its root element. */
const renderText = (tone?: TextTone, size?: TextSize, isLoading?: boolean): Element => {
    const { container } = render(
        <Text tone={tone} size={size} isLoading={isLoading}>
            Twelve lessons remaining
        </Text>,
    )
    const root = container.firstElementChild
    if (!root) throw new Error("Text rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("Text", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "atom", name: "Text" })
    })

    it("renders a paragraph, so a sentence survives being read aloud", () => {
        expect(renderText().tagName).toBe("P")
    })

    it("defaults to content rather than to a supporting fact", () => {
        const root = renderText()
        expect(root.getAttribute("data-tone")).toBe("default")
        expect(root.getAttribute("data-size")).toBe("md")
    })

    it("badges itself so a gate can read the tier off the rendered node", () => {
        const root = renderText("muted", "sm")
        expect(root.getAttribute("data-tier")).toBe("atom")
        expect(root.getAttribute("data-component")).toBe("Text")
        expect(root.getAttribute("data-tone")).toBe("muted")
        expect(root.getAttribute("data-size")).toBe("sm")
        expect(root.getAttribute("data-loading")).toBe("false")
    })

    it("renders the resolved copy it was handed", () => {
        expect(renderText().textContent).toBe("Twelve lessons remaining")
    })

    it("actually draws the two tones differently", () => {
        const drawn = new Set<string>()
        for (const tone of TONES) {
            drawn.add(renderText(tone).getAttribute("class") ?? "")
            cleanup()
        }
        expect(drawn.size).toBe(TONES.length)
    })

    it("actually draws the two sizes differently", () => {
        const drawn = new Set<string>()
        for (const size of SIZES) {
            drawn.add(renderText("default", size).getAttribute("class") ?? "")
            cleanup()
        }
        expect(drawn.size).toBe(SIZES.length)
    })

    it("keeps every class it draws on the house scale", () => {
        for (const tone of TONES) {
            for (const size of SIZES) {
                for (const isLoading of [false, true]) {
                    const classes = renderText(tone, size, isLoading).getAttribute("class") ?? ""
                    const label = `${tone}/${size}/${isLoading}`
                    expect(classes.trim(), label).not.toBe("")
                    expect(FRACTIONAL_SPACING.test(classes), label).toBe(false)
                    expect(ARBITRARY_VALUE.test(classes), label).toBe(false)
                    cleanup()
                }
            }
        }
    })

    it("never paints a margin of its own, because the node above owns every gap", () => {
        for (const tone of TONES) {
            const classes = renderText(tone).getAttribute("class") ?? ""
            for (const token of classes.split(/\s+/)) {
                expect(/^-?m[trblxy]?-/.test(token), token).toBe(false)
            }
            cleanup()
        }
    })

    it("rests as itself rather than as a second shape", () => {
        const root = renderText("default", "md", true)
        expect(root.tagName).toBe("P")
        expect(root.getAttribute("data-loading")).toBe("true")
        expect(root.getAttribute("aria-hidden")).toBe("true")
        expect(root.getAttribute("class")).toContain("skeleton")
        expect(root.textContent).toBe("Twelve lessons remaining")
    })

    it("offers no className or style back door", () => {
        const backDoor = { className: "back-door", style: { color: "red" } } as unknown as TextProps
        const { container } = render(<Text {...backDoor}>Twelve lessons remaining</Text>)
        const root = container.firstElementChild
        expect(root?.getAttribute("class") ?? "").not.toContain("back-door")
        expect(root?.getAttribute("style")).toBe(null)
    })
})
