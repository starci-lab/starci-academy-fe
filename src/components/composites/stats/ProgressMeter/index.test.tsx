/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { ProgressMeter, meta, type ProgressMeterProps } from "@/components/composites/stats/ProgressMeter"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: that the figure reaches the accessibility tree AND the screen, once
 * each. A bar is the one control where the drawn value and the announced value can silently
 * disagree - one is a width, the other an attribute - so these read what a screen reader reads.
 */

/** Render with the given props and hand back the row. */
const renderMeter = (props: Partial<ProgressMeterProps> = {}): Element => {
    const merged: ProgressMeterProps = {
        label: "Weekly goal",
        percent: 40,
        readout: "4 of 10",
        ...props,
    }
    const { container } = render(<ProgressMeter {...merged} />)
    const root = container.firstElementChild
    if (!root) throw new Error("ProgressMeter rendered nothing")
    return root
}

/** The bar, as the accessibility tree sees it. */
const bar = (root: Element): Element | null => root.querySelector("[role='progressbar']")

afterEach(() => {
    cleanup()
})

describe("ProgressMeter", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "composite", name: "ProgressMeter" })
    })

    it("draws the registry key, and wears its classes rather than any of its own", () => {
        const root = renderMeter()
        expect(root.getAttribute("data-node")).toBe("stat")
        expect(root.getAttribute("class")).toBe(contractSpec("stat").classes)
    })

    it("reads the name before the figure, on a line of its own", () => {
        expect(renderMeter().children[0].textContent).toBe("Weekly goal")
    })

    it("announces the figure once and shows the readout once", () => {
        const root = renderMeter({ percent: 40, readout: "4 of 10" })
        expect(bar(root)?.getAttribute("aria-valuenow")).toBe("40")
        expect(bar(root)?.textContent).toBe("")
        expect(root.querySelector("[data-component='Badge']")?.textContent).toBe("4 of 10")
    })

    it("names the bar with what is progressing, so two on one screen tell each other apart", () => {
        expect(bar(renderMeter({ label: "Streak goal" }))?.getAttribute("aria-label")).toBe("Streak goal")
    })

    it("says what the figure MEANS through the shared contract, not a colour", () => {
        expect(renderMeter({ verdict: "passed" }).querySelector("[data-component='Badge']")
            ?.getAttribute("data-tone")).toBe("success")
        cleanup()
        expect(renderMeter({ verdict: "attention" }).querySelector("[data-component='Badge']")
            ?.getAttribute("data-tone")).toBe("warning")
    })

    it("treats a quantity with no verdict as a fact carrying no judgement", () => {
        expect(renderMeter().querySelector("[data-component='Badge']")?.getAttribute("data-tone"))
            .toBe("neutral")
    })

    it("rests as the same row, with no figure to read", () => {
        const root = renderMeter({ isLoading: true })
        expect(root.getAttribute("data-node")).toBe("stat")
        expect(root.querySelector("[data-component='Badge']")).toBeNull()
        expect(bar(root)?.getAttribute("data-loading")).toBe("true")
    })

    it("offers no className door", () => {
        const backDoor = { className: "back-door" } as unknown as ProgressMeterProps
        const { container } = render(
            <ProgressMeter {...backDoor} label="Weekly goal" percent={40} readout="4 of 10" />,
        )
        expect(container.firstElementChild?.getAttribute("class")).toBe(contractSpec("stat").classes)
    })
})
