import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { RankDeltaCaret } from "./index"

describe("RankDeltaCaret", () => {
    it("rests without reading a movement aloud while the board is in flight", () => {
        const { container } = render(<RankDeltaCaret props={{ delta: 3, accessibleLabel: "Climbed 3" }} isLoading />)
        const caret = container.querySelector("[data-component=\"RankDeltaCaret\"]")
        expect(caret).toHaveAttribute("data-loading", "true")
        expect(caret).toHaveAttribute("aria-hidden", "true")
        expect(caret).not.toHaveAttribute("data-direction")
        expect(caret?.textContent).toBe("")
    })

    it("reads a climb as an up caret with its magnitude in the success tone", () => {
        const { container } = render(<RankDeltaCaret props={{ delta: 3, accessibleLabel: "Climbed 3 places" }} />)
        const caret = container.querySelector("[data-component=\"RankDeltaCaret\"]")
        expect(caret).toHaveAttribute("data-direction", "up")
        expect(caret).toHaveAttribute("data-loading", "false")
        expect(caret).toHaveAttribute("aria-label", "Climbed 3 places")
        expect(caret?.textContent).toBe("▴3")
        expect(caret?.className).toContain("text-success")
    })

    it("drops the sign from a fall and states its size in the danger tone", () => {
        const { container } = render(<RankDeltaCaret props={{ delta: -2, accessibleLabel: "Dropped 2 places" }} />)
        const caret = container.querySelector("[data-component=\"RankDeltaCaret\"]")
        expect(caret).toHaveAttribute("data-direction", "down")
        expect(caret?.textContent).toBe("▾2")
        expect(caret?.className).toContain("text-danger")
    })

    it("draws no magnitude for a learner who played and did not move", () => {
        const { container } = render(<RankDeltaCaret props={{ delta: 0, accessibleLabel: "Unchanged" }} />)
        const caret = container.querySelector("[data-component=\"RankDeltaCaret\"]")
        expect(caret).toHaveAttribute("data-direction", "flat")
        expect(caret?.textContent).toBe("—")
        expect(caret?.className).toContain("text-muted")
    })

    it("draws the same neutral placeholder for a null baseline but keeps its own sentence", () => {
        const { container } = render(<RankDeltaCaret props={{ delta: null, accessibleLabel: "No ranking last week" }} />)
        const caret = container.querySelector("[data-component=\"RankDeltaCaret\"]")
        expect(caret).toHaveAttribute("data-direction", "flat")
        expect(caret).toHaveAttribute("aria-label", "No ranking last week")
        expect(caret?.textContent).toBe("—")
    })

    it("falls back to the neutral reading with no movement and no sentence at all", () => {
        const { container } = render(<RankDeltaCaret props={{}} />)
        const caret = container.querySelector("[data-component=\"RankDeltaCaret\"]")
        expect(caret).toHaveAttribute("data-direction", "flat")
        expect(caret).not.toHaveAttribute("aria-label")
        expect(caret?.textContent).toBe("—")
    })
})
