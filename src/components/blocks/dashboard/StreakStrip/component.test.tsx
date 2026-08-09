/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import {
    _StreakStrip,
    type StreakStripDay,
    type StreakStripLabels,
} from "@/components/blocks/dashboard/StreakStrip/component"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: that the resting strip is the SAME tree as the loaded one - same
 * keys, same seven columns - so nobody has to keep two descriptions of one shape in step. The
 * other half is that the strip is drawn by registry keys and not by markup this block invented:
 * the week is a `track`, which owns the list element and the run, and the readout is the same
 * `card-header` line the rail's standing rows use.
 */

const labels: StreakStripLabels = {
    heading: "Learning streak",
    loading: "Loading",
    empty: "No streak yet",
    currentLabel: "Current streak",
    current: "3 days",
    longest: "Longest 9 days",
}

const days: ReadonlyArray<StreakStripDay> = ["01", "02", "03", "04", "05", "06", "07"].map((day, index) => ({
    date: `2026-08-${day}`,
    active: index > 3,
    weekday: "M",
    title: `Aug ${day}, 2026`,
}))

/** Count the day columns currently on screen. */
const dayCount = (container: HTMLElement): number => container.querySelectorAll("[data-part='day']").length

/** The readout line - the `aside` of the split, drawn as a `card-header`. */
const readout = (container: HTMLElement): Element | null =>
    container.querySelector("[data-node='split'] > [data-node='card-header']")

afterEach(() => {
    cleanup()
})

describe("_StreakStrip", () => {
    it("draws a bounded surface holding a split", () => {
        const { container } = render(<_StreakStrip days={days} labels={labels} />)
        expect(container.firstElementChild?.getAttribute("data-node")).toBe("surface-card")
        expect(container.querySelector("[data-node='split']")).not.toBeNull()
    })

    it("wears the registry classes rather than any of its own", () => {
        const { container } = render(<_StreakStrip days={days} labels={labels} />)
        expect(container.firstElementChild?.getAttribute("class")).toBe(contractSpec("surface-card").classes)
        expect(container.querySelector("[data-node='split']")?.getAttribute("class")).toBe(contractSpec("split").classes)
        expect(container.querySelector("[data-node='track']")?.getAttribute("class")).toBe(contractSpec("track").classes)
    })

    it("puts the week in the body role and the readout in the aside role", () => {
        const { container } = render(<_StreakStrip days={days} labels={labels} />)
        const split = container.querySelector("[data-node='split']")
        expect(split?.getAttribute("data-roles")).toBe("body aside")
        expect(split?.children[0].getAttribute("data-node")).toBe("track")
        expect(split?.children[1].getAttribute("data-node")).toBe("card-header")
    })

    it("draws the week as a real list, so its length is announced", () => {
        const { container } = render(<_StreakStrip days={days} labels={labels} />)
        const track = container.querySelector("[data-node='track']")
        expect(track?.tagName).toBe("UL")
        expect([...(track?.children ?? [])].every((child) => child.tagName === "LI")).toBe(true)
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
        const { container } = render(<_StreakStrip isLoading days={[]} labels={labels} />)
        expect(container.firstElementChild?.getAttribute("data-node")).toBe("surface-card")
        expect(container.querySelector("[data-node='split']")).not.toBeNull()
        expect(dayCount(container)).toBe(7)
        expect(readout(container)?.children[2].getAttribute("data-loading")).toBe("true")
    })

    it("says so when the learner has no streak yet", () => {
        const { container } = render(<_StreakStrip isEmpty days={[]} labels={labels} />)
        expect(readout(container)?.children[2].textContent).toBe(labels.empty)
        expect(container.querySelector("[data-component='Badge']")).toBeNull()
    })

    it("reads the current streak as a figure and the record beside the heading", () => {
        const { container } = render(<_StreakStrip days={days} labels={labels} />)
        expect(readout(container)?.children[1].textContent).toBe(labels.currentLabel)
        expect(container.querySelector("[data-component='Badge']")?.textContent).toBe(labels.current)
        expect(container.querySelector("[data-node='section-header']")?.children[1].textContent)
            .toBe(labels.longest)
    })

    it("renders the heading once, at the level of a card title", () => {
        const { container } = render(<_StreakStrip days={days} labels={labels} />)
        expect(container.querySelectorAll("h3").length).toBe(1)
        expect(container.querySelector("h3")?.textContent).toBe(labels.heading)
    })
})
