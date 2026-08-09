/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { SurfaceCard, meta, type SurfaceCardProps } from "@/components/composites/cards/SurfaceCard"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: that this composite decides nothing a registry key already decides.
 * It picks WHICH key - a surface with a footer is a different tree from one without, and a title
 * line with a control is a different tree from one with a fact - and it maps copy onto atoms.
 * If it ever grew a class, a padding step or a variant, it would have become a second registry
 * with no keys and no reasons, which is the failure this file exists to make visible.
 */

/** A stand-in for whatever the region carries. */
const Body = () => <p data-part="body">Body</p>

/** A stand-in for a closing row. */
const Footer = () => <p data-part="footer">Footer</p>

/** A stand-in for a control at the end of the title line. */
const Action = () => <button data-part="action" type="button">Manage</button>

/** Render with the given props and hand back the surface. */
const renderCard = (props: Partial<SurfaceCardProps> = {}): Element => {
    const merged: SurfaceCardProps = { label: "My courses", body: Body, ...props }
    const { container } = render(<SurfaceCard {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("SurfaceCard rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("SurfaceCard", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "composite", name: "SurfaceCard" })
    })

    it("draws the surface with no closing row as its own key, not as a card missing a footer", () => {
        const root = renderCard()
        expect(root.getAttribute("data-node")).toBe("surface-card")
        expect(root.getAttribute("data-roles")).toBe("heading body")
    })

    it("draws a surface WITH a closing row as the card key, and puts the footer last", () => {
        const root = renderCard({ footer: Footer })
        expect(root.getAttribute("data-node")).toBe("card")
        expect(root.getAttribute("data-roles")).toBe("heading body footer")
        expect(root.children[root.children.length - 1].getAttribute("data-part")).toBe("footer")
    })

    it("wears the registry classes rather than any of its own", () => {
        expect(renderCard().getAttribute("class")).toBe(contractSpec("surface-card").classes)
        cleanup()
        expect(renderCard({ footer: Footer }).getAttribute("class")).toBe(contractSpec("card").classes)
    })

    it("titles the region at the level of a card, unless the outline says otherwise", () => {
        expect(renderCard().querySelector("h3")?.textContent).toBe("My courses")
        cleanup()
        expect(renderCard({ level: 2 }).querySelector("h2")?.textContent).toBe("My courses")
    })

    it("puts a supporting fact on the title's baseline", () => {
        const header = renderCard({ meta: "2 courses" }).querySelector("[data-node='section-header']")
        expect(header?.getAttribute("data-roles")).toBe("heading meta")
        expect(header?.children[1].textContent).toBe("2 courses")
    })

    it("puts a control at the end of the title line instead", () => {
        const header = renderCard({ action: Action }).querySelector("[data-node='page-header']")
        expect(header?.getAttribute("data-roles")).toBe("heading action")
        expect(header?.querySelector("[data-part='action']")).not.toBeNull()
    })

    it("draws a bare title when there is neither, rather than an empty row", () => {
        const root = renderCard()
        expect(root.querySelector("[data-node='section-header']")).toBeNull()
        expect(root.querySelector("[data-node='page-header']")).toBeNull()
        expect(root.children[0].tagName).toBe("H3")
    })

    it("hangs the body it was handed, and adds no wrapper around it", () => {
        const root = renderCard()
        expect(root.children[1].getAttribute("data-part")).toBe("body")
    })

    it("rests the parts that are waiting and never the title", () => {
        const root = renderCard({ meta: "2 courses", isLoading: true })
        const header = root.querySelector("[data-node='section-header']")
        expect(header?.children[1].getAttribute("data-loading")).toBe("true")
        // The title is copy the caller already holds, so resting it would hide a word that is
        // not waiting on anything - and leave the region unnamed exactly while a reader is
        // working out what it is.
        expect(root.querySelector("h3")?.getAttribute("data-loading")).toBe("false")
    })

    it("offers no className, padding or variant door - each of those is a key", () => {
        const backDoor = {
            className: "back-door",
            padding: 6,
            variant: "nested",
        } as unknown as SurfaceCardProps
        const { container } = render(<SurfaceCard {...backDoor} label="My courses" body={Body} />)
        const root = container.firstElementChild
        expect(root?.getAttribute("class")).toBe(contractSpec("surface-card").classes)
    })
})
