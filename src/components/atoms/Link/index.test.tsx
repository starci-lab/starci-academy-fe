/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { Link, meta, type LinkEmphasis, type LinkProps } from "@/components/atoms/Link"

/**
 * What these tests guard: that a thing which changes the address is an `<a href>`. A button with
 * an onClick that navigates looks identical and takes three things away from the reader - the
 * new tab, the copied address, and seeing where it goes before pressing. This atom exists so
 * that difference cannot be lost by accident.
 */

/** Every emphasis, mirrored so a loop can walk the whole vocabulary. */
const EMPHASES: ReadonlyArray<LinkEmphasis> = ["default", "brand", "primary"]

/** Render with the given props and hand back the anchor. */
const renderLink = (props: Partial<LinkProps> = {}): HTMLAnchorElement => {
    const merged: LinkProps = { href: "/dashboard", children: "Dashboard", ...props }
    const { container } = render(<Link {...merged} />)
    const root = container.querySelector("a")
    if (!root) throw new Error("Link did not render an anchor")
    return root
}

afterEach(() => {
    cleanup()
})

describe("Link", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "atom", name: "Link" })
    })

    it("renders a real anchor carrying a real address", () => {
        const root = renderLink({ href: "/authentication" })
        expect(root.tagName).toBe("A")
        expect(root.getAttribute("href")).toBe("/authentication")
    })

    it("badges itself so a gate can read the tier off the rendered node", () => {
        const root = renderLink({ emphasis: "brand" })
        expect(root.getAttribute("data-tier")).toBe("atom")
        expect(root.getAttribute("data-component")).toBe("Link")
        expect(root.getAttribute("data-emphasis")).toBe("brand")
    })

    it("renders the resolved copy it was handed", () => {
        expect(renderLink().textContent).toContain("Dashboard")
    })

    it("draws the two emphases differently", () => {
        const drawn = new Set<string>()
        for (const emphasis of EMPHASES) {
            drawn.add(renderLink({ emphasis }).getAttribute("class") ?? "")
            cleanup()
        }
        expect(drawn.size).toBe(EMPHASES.length)
    })

    it("draws the glyph it was given, and only when it was given one", () => {
        expect(renderLink({ icon: "brand" }).querySelector("svg")).not.toBeNull()
        cleanup()
        expect(renderLink().querySelector("svg")).toBeNull()
    })

    it("wears the vendor button for the one link that is a surface's main action", () => {
        // A main action is a solid fill, and the fill and its foreground have to arrive as a
        // PAIR - which is what borrowing the vendor's own variant buys over assembling one here.
        expect(renderLink({ emphasis: "primary" }).getAttribute("class")).toContain("button--primary")
    })

    it("never paints a margin of its own, because the node above owns every gap", () => {
        for (const token of (renderLink().getAttribute("class") ?? "").split(/\s+/)) {
            expect(/^-?m[trblxy]?-/.test(token), token).toBe(false)
        }
    })

    it("offers no className or style back door", () => {
        const backDoor = { className: "back-door", style: { color: "red" } } as unknown as LinkProps
        const { container } = render(<Link {...backDoor} href="/dashboard">Dashboard</Link>)
        const root = container.querySelector("a")
        expect(root?.getAttribute("class") ?? "").not.toContain("back-door")
        expect(root?.getAttribute("style")).toBe(null)
    })
})
