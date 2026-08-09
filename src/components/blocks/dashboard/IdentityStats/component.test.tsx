/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { _IdentityStats, type IdentityStatRow, type IdentityStatsLabels } from "@/components/blocks/dashboard/IdentityStats/component"
import { treeSpec } from "@/components/classNames"

/**
 * What these tests guard: that this block draws registry trees rather than markup of
 * its own, and that a row in each of the three states renders as the SAME shape with
 * different text - which is the whole reason a resting row cannot drift from a loaded
 * one.
 */

const labels: IdentityStatsLabels = {
    heading: "Your standing",
    loading: "Loading",
    empty: "Not available",
}

const rows: ReadonlyArray<IdentityStatRow> = [
    { label: "Streak", value: "5 days" },
    { label: "AI credit", isLoading: true, value: "" },
    { label: "Reward points", isEmpty: true, value: "" },
]

/** Read the `data-state` of every value node, in render order. */
const valueStates = (container: HTMLElement): Array<string> =>
    [...container.querySelectorAll("[data-part='value']")].map((node) => node.getAttribute("data-state") ?? "")

afterEach(() => {
    cleanup()
})

describe("_IdentityStats", () => {
    it("draws a section holding one stat tree per row", () => {
        const { container } = render(<_IdentityStats rows={rows} labels={labels} />)
        const root = container.firstElementChild
        expect(root?.getAttribute("data-node")).toBe("section")
        expect(container.querySelectorAll("[data-node='stat']").length).toBe(rows.length)
    })

    it("wears the registry classes rather than any of its own", () => {
        const { container } = render(<_IdentityStats rows={rows} labels={labels} />)
        expect(container.firstElementChild?.getAttribute("class")).toBe(treeSpec("section").classes)
        const stat = container.querySelector("[data-node='stat']")
        expect(stat?.getAttribute("class")).toBe(treeSpec("stat").classes)
    })

    it("renders the heading once", () => {
        const { container } = render(<_IdentityStats rows={rows} labels={labels} />)
        const headings = container.querySelectorAll("h2")
        expect(headings.length).toBe(1)
        expect(headings[0].textContent).toBe(labels.heading)
    })

    it("keeps every row in place across the three states", () => {
        const { container } = render(<_IdentityStats rows={rows} labels={labels} />)
        expect(valueStates(container)).toEqual(["ready", "loading", "empty"])
        expect([...container.querySelectorAll("[data-part='label']")].map((node) => node.textContent))
            .toEqual(["Streak", "AI credit", "Reward points"])
    })

    it("reads the value when the row is loaded", () => {
        const { container } = render(<_IdentityStats rows={rows} labels={labels} />)
        expect(container.querySelector("[data-state='ready']")?.textContent).toBe("5 days")
    })

    it("stands in for a value that has not arrived", () => {
        const { container } = render(<_IdentityStats rows={rows} labels={labels} />)
        expect(container.querySelector("[data-state='loading']")?.textContent).toBe(labels.loading)
    })

    it("stands in for a request that settled with nothing", () => {
        const { container } = render(<_IdentityStats rows={rows} labels={labels} />)
        expect(container.querySelector("[data-state='empty']")?.textContent).toBe(labels.empty)
    })

    it("reads a row that is still loading as loading rather than as empty", () => {
        const both: ReadonlyArray<IdentityStatRow> = [{ label: "Streak", isLoading: true, isEmpty: true, value: "" }]
        const { container } = render(<_IdentityStats rows={both} labels={labels} />)
        expect(container.querySelector("[data-part='value']")?.getAttribute("data-state")).toBe("loading")
        expect(container.querySelector("[data-part='value']")?.textContent).toBe(labels.loading)
    })

    it("renders the heading and an empty stack when there are no rows", () => {
        const { container } = render(<_IdentityStats rows={[]} labels={labels} />)
        expect(container.querySelectorAll("[data-node='stat']").length).toBe(0)
        expect(container.querySelector("h2")?.textContent).toBe(labels.heading)
    })
})
