/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { RankBadge, rankVerdict, meta } from "@/components/blocks/dashboard/RankBadge"

/**
 * What these tests guard: that the podium is a MEANING rather than a colour picked here, and
 * that the place is readable as words. The original said both with multicolour medal art, which
 * a reader who cannot see colour gets nothing at all from.
 */

afterEach(() => {
    cleanup()
})

describe("rankVerdict", () => {
    it("treats the first three places as the podium and everything below as a plain fact", () => {
        expect([1, 2, 3].map(rankVerdict)).toEqual(["passed", "passed", "passed"])
        expect([4, 41].map(rankVerdict)).toEqual(["neutral", "neutral"])
    })
})

describe("RankBadge", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "block", name: "RankBadge" })
    })

    it("says the place in words, not only in a tone", () => {
        const { container } = render(<RankBadge rank={1} label="1st" />)
        expect(container.firstElementChild?.textContent).toBe("1st")
    })

    it("resolves the podium through the shared vocabulary rather than naming a colour", () => {
        const { container } = render(<RankBadge rank={2} label="2nd" />)
        expect(container.firstElementChild?.getAttribute("data-tone")).toBe("success")
        cleanup()
        const plain = render(<RankBadge rank={41} label="41st" />)
        expect(plain.container.firstElementChild?.getAttribute("data-tone")).toBe("neutral")
    })

    it("rests as itself", () => {
        const { container } = render(<RankBadge rank={1} label="1st" isLoading />)
        expect(container.firstElementChild?.getAttribute("data-loading")).toBe("true")
    })
})
