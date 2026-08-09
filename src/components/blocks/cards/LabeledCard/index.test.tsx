/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { LabeledCard, meta, type LabeledCardProps } from "@/components/blocks/cards/LabeledCard"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: that the name is a SIBLING of the content rather than a child of it -
 * which is the entire difference between this block and `SurfaceCard`, and the thing a caller
 * relies on when the body is itself a surface. After that, the two title-line shapes: a fact and
 * a control are different keys, so a caller cannot end up with both and silently see one.
 */

/** A body that says which slot it landed in. */
const Body = () => <span data-testid="body">body</span>

/** A caption that says which slot it landed in. */
const Description = () => <span data-testid="description">caption</span>

/** A control that says which slot it landed in. */
const Action = () => <span data-testid="action">more</span>

/** Render with the given props and hand back the root node. */
const renderCard = (props: Partial<LabeledCardProps> = {}): Element => {
    const merged: LabeledCardProps = {
        label: "My courses",
        body: Body,
        ...props,
    }
    const { container } = render(<LabeledCard {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("LabeledCard rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("LabeledCard", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "block", name: "LabeledCard" })
    })

    it("names a region rather than drawing a surface around it", () => {
        const root = renderCard()
        expect(root.getAttribute("data-node")).toBe("section")
        expect(root.getAttribute("class")).toBe(contractSpec("section").classes)
        expect(root.children[0].tagName).toBe("H2")
        expect(root.children[1].getAttribute("data-testid")).toBe("body")
    })

    it("puts a passive fact on the name's baseline", () => {
        const root = renderCard({ meta: "3 enrolled" })
        const header = root.querySelector("[data-node='section-header']")
        expect(header?.getAttribute("data-roles")).toBe("heading meta")
        expect(header?.children[1].textContent).toBe("3 enrolled")
    })

    it("puts a control at the end of the name's line, on a key of its own", () => {
        const root = renderCard({ action: Action })
        const header = root.querySelector("[data-node='page-header']")
        expect(header?.getAttribute("data-roles")).toBe("heading action")
        expect(header?.querySelector("[data-testid='action']")).not.toBeNull()
        expect(root.querySelector("[data-node='section-header']")).toBeNull()
    })

    it("holds a closing caption to the body it comments on, not to the region's own seam", () => {
        const root = renderCard({ description: Description })
        const stack = root.querySelector("[data-node='stack']")
        expect(stack?.getAttribute("class")).toBe(contractSpec("stack").classes)
        expect(stack?.querySelector("[data-testid='body']")).not.toBeNull()
        expect(stack?.querySelector("[data-testid='description']")).not.toBeNull()
    })

    it("keeps the region named while everything under it rests", () => {
        const root = renderCard({ meta: "3 enrolled", isLoading: true })
        expect(root.querySelector("h2")?.textContent).toBe("My courses")
        expect(root.querySelector("[data-component='Text']")?.getAttribute("data-loading")).toBe("true")
    })
})
