/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import { LeagueTile } from "."

/**
 * What these guard: that the plate is the tile's own and the artwork is not.
 *
 * The tile exists to frame the viewer's place, so the frame has to survive; the medal inside it
 * belongs to `RankMark`, so this file asserts that the tile DELEGATES rather than that it draws
 * any particular artwork - the day the rank vocabulary changes, only one test should fail.
 */

describe("LeagueTile", () => {
    it("frames the rank artwork on its own plate", () => {
        const { container } = render(<LeagueTile props={{ rank: 1, accessibleLabel: "Rank #1" }} />)
        const tile = container.firstElementChild
        expect(tile).not.toBeNull()
        expect(tile?.className).toContain("size-12")
        expect(tile?.className).toContain("bg-accent-soft")
        expect(tile?.className).toContain("text-accent-soft-foreground")
        // The soft accent fill already frames the standing; a border would repeat that boundary.
        expect(tile?.className).not.toContain("border")
        expect(tile?.getAttribute("data-loading")).toBe("false")
    })

    it("threads the explicit cup meaning to the closed rank artwork leaf", () => {
        const { container } = render(<LeagueTile props={{ rank: 2, artwork: "cup", accessibleLabel: "Rank #2" }} />)
        const tile = container.firstElementChild
        expect(tile).not.toBeNull()
        expect(tile?.querySelector("[data-artwork=\"cup\"] svg")).toBeInTheDocument()
    })

    it("rests at the plate's real size so the row does not reflow when the rank arrives", () => {
        const { container } = render(<LeagueTile props={{}} isLoading />)
        const tile = container.firstElementChild
        expect(tile?.getAttribute("data-loading")).toBe("true")
        expect(tile?.className).toContain("size-12")
        // A resting plate is decoration, not a rank of nothing.
        expect(tile?.getAttribute("aria-hidden")).toBe("true")
        expect(tile?.querySelector("[aria-label]")).toBeNull()
    })
})
