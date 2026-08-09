/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { _StreakStrip, type StreakStripDay, type StreakStripLabels } from "@/components/blocks/dashboard/StreakStrip/component"
import { treeSpec } from "@/components/classNames"

/**
 * What these tests guard: that the resting strip is the SAME tree as the loaded one -
 * same keys, same seven columns - so nobody has to keep two descriptions of one shape
 * in step. The other half is that the strip is drawn by registry keys and not by
 * markup this block invented.
 */

const labels: StreakStripLabels = {
    heading: "Learning streak",
    loading: "Loading",
    empty: "No streak yet",
    current: "3 day streak",
    longest: "Longest 9 days",
}

const days: readonly StreakStripDay[] = ["01", "02", "03", "04", "05", "06", "07"].map((day, index) => ({
    date: `2026-08-${day}`,
    active: index > 3,
    weekday: "M",
    title: `Aug ${day}, 2026`,
}))

/** Count the day columns currently on screen. */
const dayCount = (container: HTMLElement): number => container.querySelectorAll("[data-part='day']").length

afterEach(() => {
    cleanup()
})

describe("_StreakStrip", () => {
    it("draws a section holding a split", () => {
        const { container } = render(<_StreakStrip days={days} labels={labels} />)
        expect(container.firstElementChild?.getAttribute("data-node")).toBe("section")
        expect(container.querySelector("[data-node='split']")).not.toBeNull()
    })

    it("wears the registry classes rather than any of its own", () => {
        const { container } = render(<_StreakStrip days={days} labels={labels} />)
        expect(container.firstElementChild?.getAttribute("class")).toBe(treeSpec("section").classes)
        expect(container.querySelector("[data-node='split']")?.getAttribute("class")).toBe(treeSpec("split").classes)
    })

    it("puts the days in the body role and the readout in the aside role", () => {
        const { container } = render(<_StreakStrip days={days} labels={labels} />)
        const split = container.querySelector("[data-node='split']")
        expect(split?.getAttribute("data-roles")).toBe("body aside")
        expect(split?.children[0].getAttribute("data-part")).toBe("days")
        expect(split?.children[1].getAttribute("data-part")).toBe("readout")
    })

    it("renders one column per day, oldest first", () => {
        const { container } = render(<_StreakStrip days={days} labels={labels} />)
        expect(dayCount(container)).toBe(days.length)
        expect([...container.querySelectorAll("[data-part='date']")].map((node) => node.textContent))
            .toEqual(days.map((day) => day.title))
    })

    it("marks which days were active", () => {
        const { container } = render(<_StreakStrip days={days} labels={labels} />)
        const active = [...container.querySelectorAll("[data-part='day']")].map((node) => node.getAttribute("data-active"))
        expect(active).toEqual(days.map((day) => (day.active ? "true" : "false")))
    })

    it("rests as the same tree with the same column count", () => {
        const { container } = render(<_StreakStrip isSkeleton days={[]} labels={labels} />)
        expect(container.firstElementChild?.getAttribute("data-node")).toBe("section")
        expect(container.querySelector("[data-node='split']")).not.toBeNull()
        expect(dayCount(container)).toBe(7)
        expect(container.querySelector("[data-part='readout']")?.getAttribute("data-state")).toBe("skeleton")
    })

    it("says so when the learner has no streak yet", () => {
        const { container } = render(<_StreakStrip isEmpty days={[]} labels={labels} />)
        const readout = container.querySelector("[data-part='readout']")
        expect(readout?.getAttribute("data-state")).toBe("empty")
        expect(readout?.textContent).toBe(labels.empty)
    })

    it("reads the current and longest streak once loaded", () => {
        const { container } = render(<_StreakStrip days={days} labels={labels} />)
        expect(container.querySelector("[data-part='current']")?.textContent).toBe(labels.current)
        expect(container.querySelector("[data-part='longest']")?.textContent).toBe(labels.longest)
    })

    it("renders the heading once", () => {
        const { container } = render(<_StreakStrip days={days} labels={labels} />)
        expect(container.querySelectorAll("h2").length).toBe(1)
        expect(container.querySelector("h2")?.textContent).toBe(labels.heading)
    })
})
