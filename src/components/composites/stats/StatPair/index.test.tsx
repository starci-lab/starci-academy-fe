/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { StatPair, meta, type StatPairProps } from "@/components/composites/stats/StatPair"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: that a figure is drawn as a FACT unless it genuinely carries a
 * judgement. A screen where every number is a tinted pill has spent the badge's meaning on
 * decoration, and a reader can no longer tell which figure is the one that matters.
 */

/** Render with the given props and hand back the tile. */
const renderPair = (props: Partial<StatPairProps> = {}): Element => {
    const merged: StatPairProps = { label: "Reward points", value: "420", ...props }
    const { container } = render(<StatPair {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("StatPair rendered nothing")
    return root
}

afterEach(() => {
    cleanup()
})

describe("StatPair", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "composite", name: "StatPair" })
    })

    it("draws the registry key, and wears its classes rather than any of its own", () => {
        const root = renderPair()
        expect(root.getAttribute("data-node")).toBe("stat")
        expect(root.getAttribute("class")).toBe(contractSpec("stat").classes)
    })

    it("reads the label before the figure, and never on the same line", () => {
        const root = renderPair()
        expect(root.children[0].textContent).toBe("Reward points")
        expect(root.children[1].textContent).toBe("420")
    })

    it("draws a plain figure as text, so a badge still means something elsewhere", () => {
        expect(renderPair().querySelector("[data-component='Badge']")).toBeNull()
    })

    it("draws a figure that carries a judgement as a badge, toned by the shared contract", () => {
        const badge = renderPair({ verdict: "failed" }).querySelector("[data-component='Badge']")
        expect(badge?.textContent).toBe("420")
        expect(badge?.getAttribute("data-tone")).toBe("danger")
    })

    it("draws the glyph it was given beside the label, never beside the figure", () => {
        const root = renderPair({ icon: "reward" })
        expect(root.children[0].querySelector("svg")).not.toBeNull()
        expect(root.children[1].querySelector("svg")).toBeNull()
    })

    it("rests as the same tile, keeping the label readable", () => {
        const root = renderPair({ isLoading: true, verdict: "passed" })
        expect(root.children[0].getAttribute("data-loading")).toBe("false")
        expect(root.children[1].getAttribute("data-loading")).toBe("true")
        // A resting figure is a shimmer, not a badge: a tinted pill with no number in it would
        // be claiming a verdict about a value nobody has yet.
        expect(root.querySelector("[data-component='Badge']")).toBeNull()
    })

    it("offers no className door", () => {
        const backDoor = { className: "back-door" } as unknown as StatPairProps
        const { container } = render(<StatPair {...backDoor} label="Reward points" value="420" />)
        expect(container.firstElementChild?.getAttribute("class")).toBe(contractSpec("stat").classes)
    })
})
