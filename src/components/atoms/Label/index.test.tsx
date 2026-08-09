/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { Label, meta, type LabelProps } from "@/components/atoms/Label"

/**
 * What these tests guard: that a label is bound to a control. A label with no `for` is
 * decoration that happens to look like a label - the input is announced as unnamed and clicking
 * the word focuses nothing - and it is invisible to everyone who reads the screen by eye. The
 * second guard is that it is NOT a heading: three form labels drawn as headings put three
 * entries in the document outline of a sign-in form.
 */

/** Render with the given props and hand back the label element. */
const renderLabel = (props: Partial<LabelProps> = {}): HTMLLabelElement => {
    const merged: LabelProps = { htmlFor: "field", children: "Email", ...props }
    const { container } = render(<Label {...merged} />)
    const root = container.firstElementChild
    if (!(root instanceof HTMLLabelElement)) throw new Error("Label did not render a label element")
    return root
}

afterEach(() => {
    cleanup()
})

describe("Label", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "atom", name: "Label" })
    })

    it("renders a real label bound to the control it names", () => {
        const root = renderLabel({ htmlFor: "sign-in-email" })
        expect(root.tagName).toBe("LABEL")
        expect(root.getAttribute("for")).toBe("sign-in-email")
    })

    it("badges itself so a gate can read the tier off the rendered node", () => {
        const root = renderLabel()
        expect(root.getAttribute("data-tier")).toBe("atom")
        expect(root.getAttribute("data-component")).toBe("Label")
    })

    it("renders the resolved copy it was handed", () => {
        expect(renderLabel().textContent).toBe("Email")
    })

    it("is not a heading, so a form does not appear in the document outline", () => {
        const { container } = render(<Label htmlFor="field">Email</Label>)
        expect(container.querySelector("h1, h2, h3, h4, h5, h6")).toBeNull()
    })

    it("draws the glyph it was given, and only when it was given one", () => {
        expect(renderLabel({ icon: "email" }).querySelector("svg")).not.toBeNull()
        cleanup()
        expect(renderLabel().querySelector("svg")).toBeNull()
    })

    it("never paints a margin of its own, because the node above owns every gap", () => {
        for (const token of (renderLabel().getAttribute("class") ?? "").split(/\s+/)) {
            expect(/^-?m[trblxy]?-/.test(token), token).toBe(false)
        }
    })

    it("offers no className or style back door", () => {
        const backDoor = { className: "back-door", style: { color: "red" } } as unknown as LabelProps
        const { container } = render(<Label {...backDoor} htmlFor="field">Email</Label>)
        const root = container.firstElementChild
        expect(root?.getAttribute("class") ?? "").not.toContain("back-door")
        expect(root?.getAttribute("style")).toBe(null)
    })
})
