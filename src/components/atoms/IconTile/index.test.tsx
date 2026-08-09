/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { IconTile, meta, type IconTileProps, type IconTileSize, type IconTileTone } from "@/components/atoms/IconTile"

/**
 * What these tests guard: that the fill and the glyph colour are ONE decision. The bug this atom
 * exists to prevent is a tinted box built at a call site out of `div + class`, where the
 * background is chosen in one place and the ink in another and the pair drifts - so the tests
 * below check that every tone carries both halves, and that no two tones look alike.
 */

/** The whole tone vocabulary, mirrored so a loop can walk it. */
const TONES: ReadonlyArray<IconTileTone> = ["neutral", "accent", "success", "warning", "danger"]

/** Both steps. */
const SIZES: ReadonlyArray<IconTileSize> = ["sm", "md"]

/** Render with the given props and hand back the tile. */
const renderTile = (props: Partial<IconTileProps> = {}): Element => {
    const merged: IconTileProps = { icon: "streak", ...props }
    const { container } = render(<IconTile {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("IconTile rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("IconTile", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "atom", name: "IconTile" })
    })

    it("badges itself so a gate can read the tier off the rendered node", () => {
        const tile = renderTile({ tone: "danger", size: "md" })
        expect(tile.getAttribute("data-tier")).toBe("atom")
        expect(tile.getAttribute("data-component")).toBe("IconTile")
        expect(tile.getAttribute("data-tone")).toBe("danger")
        expect(tile.getAttribute("data-size")).toBe("md")
    })

    it("holds the glyph it was asked for", () => {
        expect(renderTile().querySelector("svg")).not.toBeNull()
    })

    it("pairs a fill with the ink that belongs to it, in every tone", () => {
        for (const tone of TONES) {
            const classes = renderTile({ tone }).getAttribute("class") ?? ""
            expect(classes, tone).toMatch(/\bbg-/)
            expect(classes, tone).toMatch(/\btext-/)
            cleanup()
        }
    })

    it("draws every tone differently, so no two meanings look alike", () => {
        const drawn = new Set<string>()
        for (const tone of TONES) {
            drawn.add(renderTile({ tone }).getAttribute("class") ?? "")
            cleanup()
        }
        expect(drawn.size).toBe(TONES.length)
    })

    it("scales its corner with its box rather than letting the two be picked apart", () => {
        const corners = SIZES.map((size) => {
            const classes = renderTile({ size }).getAttribute("class") ?? ""
            cleanup()
            return classes.split(/\s+/).find((token) => token.startsWith("rounded-"))
        })
        expect(new Set(corners).size).toBe(SIZES.length)
    })

    it("rests as the same box, with nothing in it", () => {
        const resting = renderTile({ isLoading: true })
        expect(resting.querySelector("svg")).toBeNull()
        expect(resting.getAttribute("data-loading")).toBe("true")
        expect(resting.getAttribute("aria-hidden")).toBe("true")
        expect(resting.getAttribute("class")).toContain("skeleton")
    })

    it("never paints a margin of its own, because the node above owns every gap", () => {
        for (const token of (renderTile().getAttribute("class") ?? "").split(/\s+/)) {
            expect(/^-?m[trblxy]?-/.test(token), token).toBe(false)
        }
    })

    it("offers no className or style back door", () => {
        const backDoor = { className: "back-door", style: { color: "red" } } as unknown as IconTileProps
        const { container } = render(<IconTile {...backDoor} icon="streak" />)
        const root = container.firstElementChild
        expect(root?.getAttribute("class") ?? "").not.toContain("back-door")
        expect(root?.getAttribute("style")).toBe(null)
    })
})
