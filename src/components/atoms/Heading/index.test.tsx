/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { Heading, meta, type HeadingLevel, type HeadingProps } from "@/components/atoms/Heading"

/**
 * What these tests are really guarding: that a heading looks the same everywhere and can only be
 * changed here. Two failure modes matter - the tag drifting away from the visual level, which
 * quietly breaks the document outline for anyone not looking at the screen, and a caller finding
 * a way to restyle one heading, which ends the idea that "the section heading" is one thing.
 */

/** Fractional Tailwind spacing (gap-1.5, p-2.5) is off the house scale. */
const FRACTIONAL_SPACING = /\b[a-z-]+-\d+\.5\b/

/** An arbitrary Tailwind value escapes the token system entirely. */
const ARBITRARY_VALUE = /\[[^\]]+\]/

/** Every level, so a loop can walk the whole vocabulary instead of restating it. */
const LEVELS: readonly HeadingLevel[] = [1, 2, 3, 4]

/** Render one level and hand back its root element. */
const renderHeading = (level?: HeadingLevel, isSkeleton?: boolean): Element => {
    const { container } = render(
        <Heading level={level} isSkeleton={isSkeleton}>
            Course catalogue
        </Heading>,
    )
    const root = container.firstElementChild
    if (!root) throw new Error("Heading rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("Heading", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "atom", name: "Heading" })
    })

    it("renders the element that matches the level it was given", () => {
        for (const level of LEVELS) {
            expect(renderHeading(level).tagName, `level ${level}`).toBe(`H${level}`)
            cleanup()
        }
    })

    it("falls back to a section heading rather than a page heading", () => {
        expect(renderHeading().tagName).toBe("H2")
        expect(renderHeading().getAttribute("data-level")).toBe("2")
    })

    it("badges itself so a gate can read the tier off the rendered node", () => {
        const root = renderHeading(3)
        expect(root.getAttribute("data-tier")).toBe("atom")
        expect(root.getAttribute("data-component")).toBe("Heading")
        expect(root.getAttribute("data-level")).toBe("3")
        expect(root.getAttribute("data-skeleton")).toBe("false")
    })

    it("renders the resolved copy it was handed", () => {
        expect(renderHeading(1).textContent).toBe("Course catalogue")
    })

    it("keeps every class it draws on the house scale", () => {
        for (const level of LEVELS) {
            for (const isSkeleton of [false, true]) {
                const classes = renderHeading(level, isSkeleton).getAttribute("class") ?? ""
                const label = `level ${level} skeleton ${isSkeleton}`
                expect(classes.trim(), label).not.toBe("")
                expect(FRACTIONAL_SPACING.test(classes), label).toBe(false)
                expect(ARBITRARY_VALUE.test(classes), label).toBe(false)
                cleanup()
            }
        }
    })

    it("never paints a margin of its own, because the node above owns every gap", () => {
        for (const level of LEVELS) {
            const classes = renderHeading(level).getAttribute("class") ?? ""
            for (const token of classes.split(/\s+/)) {
                expect(/^-?m[trblxy]?-/.test(token), token).toBe(false)
            }
            cleanup()
        }
    })

    it("rests as itself rather than as a second shape", () => {
        const root = renderHeading(2, true)
        expect(root.tagName).toBe("H2")
        expect(root.getAttribute("data-skeleton")).toBe("true")
        expect(root.getAttribute("aria-hidden")).toBe("true")
        expect(root.getAttribute("class")).toContain("animate-pulse")
        expect(root.textContent).toBe("Course catalogue")
    })

    it("hides nothing from assistive technology while it is not resting", () => {
        expect(renderHeading(2).getAttribute("aria-hidden")).toBe(null)
    })

    it("offers no className or style back door", () => {
        // The props type has neither, so this is what a JavaScript caller would have to do to
        // reach in. Nothing is spread onto the element, so nothing arrives.
        const backDoor = { className: "back-door", style: { color: "red" } } as unknown as HeadingProps
        const { container } = render(<Heading {...backDoor}>Course catalogue</Heading>)
        const root = container.firstElementChild
        expect(root?.getAttribute("class") ?? "").not.toContain("back-door")
        expect(root?.getAttribute("style")).toBe(null)
    })
})
