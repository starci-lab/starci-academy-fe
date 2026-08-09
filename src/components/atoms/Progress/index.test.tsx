/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { Progress, meta, type ProgressProps } from "@/components/atoms/Progress"

/**
 * What these tests guard: that the figure reaches the accessibility tree. A progress bar is the
 * one control where the visual and the announced value can silently disagree - the fill is a
 * width and the value is an attribute - so the tests read what a screen reader reads, not the
 * pixels. The name is required for the same reason: two bars on one screen are indistinguishable
 * without it.
 */

/** Render with the given props and hand back the bar as the accessibility tree sees it. */
const renderProgress = (props: Partial<ProgressProps> = {}): Element => {
    const merged: ProgressProps = { value: 40, label: "System Design", ...props }
    const { container } = render(<Progress {...merged} />)
    const bar = container.querySelector("[role='progressbar']")
    if (!bar) throw new Error("Progress did not render a progressbar")
    return bar
}

afterEach(() => {
    cleanup()
})

describe("Progress", () => {
    it("declares its own tier", () => {
        expect(meta).toEqual({ tier: "atom", name: "Progress" })
    })

    it("badges itself so a gate can read the tier off the rendered node", () => {
        const bar = renderProgress()
        expect(bar.getAttribute("data-tier")).toBe("atom")
        expect(bar.getAttribute("data-component")).toBe("Progress")
        expect(bar.getAttribute("data-loading")).toBe("false")
    })

    it("announces the figure it was given, on a fixed nought-to-hundred scale", () => {
        const bar = renderProgress({ value: 40 })
        expect(bar.getAttribute("aria-valuenow")).toBe("40")
        expect(bar.getAttribute("aria-valuemin")).toBe("0")
        expect(bar.getAttribute("aria-valuemax")).toBe("100")
    })

    it("carries the name of what is progressing, so two bars tell each other apart", () => {
        expect(renderProgress({ label: "Full Stack" }).getAttribute("aria-label")).toBe("Full Stack")
    })

    it("draws a fill sized from the value rather than a bar of its own", () => {
        const bar = renderProgress({ value: 75 })
        const fill = bar.querySelector("[data-slot='progress-bar-fill']")
        expect(fill?.getAttribute("style")).toContain("75%")
    })

    it("prints no number of its own, so a caller that prints one does not print it twice", () => {
        expect(renderProgress({ value: 40 }).textContent).toBe("")
    })

    it("rests as the same track rather than as a second shape", () => {
        const bar = renderProgress({ isLoading: true })
        expect(bar.getAttribute("data-loading")).toBe("true")
        expect(bar.getAttribute("class")).toContain("skeleton")
        expect(bar.getAttribute("aria-valuenow")).toBe("0")
    })

    it("offers no className or style back door", () => {
        const backDoor = { className: "back-door", style: { color: "red" } } as unknown as ProgressProps
        const { container } = render(<Progress {...backDoor} value={10} label="Course" />)
        const bar = container.querySelector("[role='progressbar']")
        expect(bar?.getAttribute("class") ?? "").not.toContain("back-door")
    })
})
