/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import {
    IconLabelValueRow,
    meta,
    type IconLabelValueRowProps,
} from "@/components/composites/lists/IconLabelValueRow"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: the order of the three parts, and that only the VALUE rests. The order
 * is what makes the row scannable down a rail - glyph, name, fact, always in that place - and
 * resting the label as well would leave three identical shimmer bars where a reader could
 * otherwise already see which figure is still coming.
 */

/** Render with the given props and hand back the row. */
const renderRow = (props: Partial<IconLabelValueRowProps> = {}): Element => {
    const merged: IconLabelValueRowProps = {
        icon: "streak",
        label: "Streak",
        value: "5 days",
        ...props,
    }
    const { container } = render(<IconLabelValueRow {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("IconLabelValueRow rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("IconLabelValueRow", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "composite", name: "IconLabelValueRow" })
    })

    it("draws the registry key, and wears its classes rather than any of its own", () => {
        const root = renderRow()
        expect(root.getAttribute("data-node")).toBe("card-header")
        expect(root.getAttribute("data-roles")).toBe("media heading meta")
        expect(root.getAttribute("class")).toBe(contractSpec("card-header").classes)
    })

    it("keeps the three parts in the one order that makes a rail scannable", () => {
        const root = renderRow()
        expect(root.children.length).toBe(3)
        expect(root.children[0].tagName).toBe("svg")
        expect(root.children[1].textContent).toBe("Streak")
        expect(root.children[2].textContent).toBe("5 days")
    })

    it("sets the name more firmly than the fact beside it, without changing its size", () => {
        const root = renderRow()
        const label = root.children[1].getAttribute("class") ?? ""
        const value = root.children[2].getAttribute("class") ?? ""
        expect(label).toContain("weight-medium")
        expect(label).toContain("body-sm")
        expect(value).toContain("body-sm")
        expect(value).toContain("color-muted")
    })

    it("rests the value and never the label", () => {
        const root = renderRow({ isLoading: true })
        expect(root.children[1].getAttribute("data-loading")).toBe("false")
        expect(root.children[2].getAttribute("data-loading")).toBe("true")
    })

    it("lets the surface draw a value that carries a state rather than a number", () => {
        const Value = () => <span data-part="badge">3 days</span>
        const root = renderRow({ valueSlot: Value })
        expect(root.children[2].getAttribute("data-part")).toBe("badge")
    })

    it("never sets a colour on the glyph, so it inherits the row's ink", () => {
        const glyph = renderRow().children[0]
        expect(glyph.getAttribute("class") ?? "").not.toContain("text-")
        expect(glyph.getAttribute("fill")).toBe("currentColor")
    })

    it("offers no className door", () => {
        const backDoor = { className: "back-door" } as unknown as IconLabelValueRowProps
        const { container } = render(
            <IconLabelValueRow {...backDoor} icon="streak" label="Streak" value="5 days" />,
        )
        expect(container.firstElementChild?.getAttribute("class")).toBe(contractSpec("card-header").classes)
    })
})
