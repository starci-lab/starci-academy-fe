/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { SectionCard, meta, type SectionCardProps } from "@/components/blocks/cards/SectionCard"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: the two facts that make this a DIFFERENT card from `SurfaceCard`
 * rather than a second copy of it - that the title line is the glyph-led `card-header`, and
 * that the surface key changes with the footer instead of a prop deciding it. The third is the
 * resting rule: the title must keep its words while everything around it shimmers, because a
 * region that goes nameless while it loads is a region a reader cannot skip past.
 */

/** A body that says which slot it landed in. */
const Body = () => <span data-testid="body">body</span>

/** A footer that says which slot it landed in. */
const Footer = () => <span data-testid="footer">footer</span>

/** Render with the given props and hand back the root node. */
const renderCard = (props: Partial<SectionCardProps> = {}): Element => {
    const merged: SectionCardProps = {
        label: "Learning streak",
        icon: "streak",
        body: Body,
        ...props,
    }
    const { container } = render(<SectionCard {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("SectionCard rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("SectionCard", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "block", name: "SectionCard" })
    })

    it("draws a bounded surface that ends with its body when nothing closes it", () => {
        const root = renderCard()
        expect(root.getAttribute("data-node")).toBe("surface-card")
        expect(root.getAttribute("class")).toBe(contractSpec("surface-card").classes)
    })

    it("changes KEY rather than taking a prop when a footer closes the card", () => {
        const root = renderCard({ footer: Footer })
        expect(root.getAttribute("data-node")).toBe("card")
        expect(root.getAttribute("data-roles")).toBe("heading body footer")
        expect(root.querySelector("[data-testid='footer']")).not.toBeNull()
    })

    it("leads the title line with the glyph that says what kind of card this is", () => {
        const root = renderCard()
        const header = root.querySelector("[data-node='card-header']")
        expect(header?.getAttribute("data-roles")).toBe("media heading meta")
        expect(header?.children[0].getAttribute("data-component")).toBe("IconTile")
        expect(header?.children[1].tagName).toBe("H3")
    })

    it("says the verdict in the tile's own vocabulary rather than in a colour", () => {
        const root = renderCard({ verdict: "passed" })
        expect(root.querySelector("[data-component='IconTile']")?.getAttribute("data-tone")).toBe("success")
    })

    it("puts the supporting fact on the title's baseline", () => {
        const root = renderCard({ meta: "9 days" })
        const header = root.querySelector("[data-node='card-header']")
        expect(header?.children[2].textContent).toBe("9 days")
    })

    it("rests every part except the name of the region", () => {
        const root = renderCard({ meta: "9 days", isLoading: true })
        expect(root.querySelector("h3")?.textContent).toBe("Learning streak")
        expect(root.querySelector("[data-component='IconTile']")?.getAttribute("data-loading")).toBe("true")
        expect(root.querySelector("[data-component='Text']")?.getAttribute("data-loading")).toBe("true")
    })
})
