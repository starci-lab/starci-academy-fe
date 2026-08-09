/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { RankDeltaCaret, rankDeltaVerdict, meta } from "@/components/blocks/profile/RankDeltaCaret"

/**
 * What these tests guard: that the direction is readable without colour, and that "no baseline"
 * and "no movement" stay two different answers. Collapsing them would tell a learner who held
 * their place that nobody had measured.
 */

afterEach(() => {
    cleanup()
})

describe("rankDeltaVerdict", () => {
    it("reads a climb, a drop and a hold as three different things", () => {
        expect(rankDeltaVerdict(2)).toBe("passed")
        expect(rankDeltaVerdict(-1)).toBe("attention")
        expect(rankDeltaVerdict(0)).toBe("neutral")
    })
})

describe("RankDeltaCaret", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "block", name: "RankDeltaCaret" })
    })

    it("says the movement in words, with the tone only agreeing", () => {
        const { container } = render(<RankDeltaCaret delta={2} label="up 2" />)
        expect(container.firstElementChild?.textContent).toBe("up 2")
        expect(container.firstElementChild?.getAttribute("data-tone")).toBe("success")
    })

    it("marks a drop as something to look at rather than as a failure", () => {
        const { container } = render(<RankDeltaCaret delta={-1} label="down 1" />)
        expect(container.firstElementChild?.getAttribute("data-tone")).toBe("warning")
    })

    it("keeps a held place visible, because it is an answer", () => {
        const { container } = render(<RankDeltaCaret delta={0} label="no change" />)
        expect(container.firstElementChild?.textContent).toBe("no change")
    })

    it("says nothing when there is nothing to compare with", () => {
        const { container } = render(<RankDeltaCaret delta={null} label="no change" />)
        expect(container.firstElementChild).toBeNull()
    })
})
