/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render } from "@testing-library/react"
import {
    _IdentityStats,
    type IdentityStatRow,
    type IdentityStatsLabels,
} from "@/components/blocks/dashboard/IdentityStats/component"
import { contractSpec } from "@/components/contracts"

/**
 * What these tests guard: that this block draws registry trees rather than markup of its own,
 * that a row is a LINE - glyph, name, figure, in that order - and that a row in each of the
 * three states renders as the SAME shape with different text, which is the whole reason a
 * resting row cannot drift from a loaded one.
 */

const labels: IdentityStatsLabels = {
    loading: "Loading",
    empty: "Sign in to see",
}

const rows: ReadonlyArray<IdentityStatRow> = [
    { label: "Streak", icon: "streak", value: "5 days" },
    { label: "AI credit", icon: "credit", isLoading: true, value: "" },
    { label: "Reward points", icon: "reward", isEmpty: true, value: "" },
]

/** Every row currently on screen, in render order. */
const rowNodes = (container: HTMLElement): Array<Element> =>
    [...container.querySelectorAll("[data-node='card-header']")]

/** The figure each row is reporting - the `meta` role, which is the row's last child. */
const values = (container: HTMLElement): Array<string> =>
    rowNodes(container).map((row) => row.children[2]?.textContent ?? "")

/** Whether each row's figure is resting, in render order. */
const restingFlags = (container: HTMLElement): Array<string> =>
    rowNodes(container).map((row) => row.children[2]?.getAttribute("data-loading") ?? "")

afterEach(() => {
    cleanup()
})

describe("_IdentityStats", () => {
    it("draws one card-header row per stat, and nothing around them", () => {
        const { container } = render(<_IdentityStats rows={rows} labels={labels} />)
        expect(rowNodes(container).length).toBe(rows.length)
        expect(container.firstElementChild?.getAttribute("data-node")).toBe("card-header")
    })

    it("wears the registry classes rather than any of its own", () => {
        const { container } = render(<_IdentityStats rows={rows} labels={labels} />)
        expect(rowNodes(container)[0].getAttribute("class")).toBe(contractSpec("card-header").classes)
    })

    it("holds the key's contract: a glyph, then the name, then the figure", () => {
        const { container } = render(<_IdentityStats rows={rows} labels={labels} />)
        const row = rowNodes(container)[0]
        expect(row.getAttribute("data-roles")).toBe("media heading meta")
        expect(row.children.length).toBe(3)
        expect(row.children[0].tagName).toBe("svg")
        expect(row.children[1].textContent).toBe("Streak")
        expect(row.children[2].textContent).toBe("5 days")
    })

    it("keeps every row in place across the three states", () => {
        const { container } = render(<_IdentityStats rows={rows} labels={labels} />)
        expect(rowNodes(container).map((row) => row.children[1].textContent))
            .toEqual(["Streak", "AI credit", "Reward points"])
        expect(restingFlags(container)).toEqual(["false", "true", "false"])
    })

    it("reads the value when the row is loaded", () => {
        const { container } = render(<_IdentityStats rows={rows} labels={labels} />)
        expect(values(container)[0]).toBe("5 days")
    })

    it("stands in for a value that has not arrived", () => {
        const { container } = render(<_IdentityStats rows={rows} labels={labels} />)
        expect(values(container)[1]).toBe(labels.loading)
    })

    it("stands in for a request that settled with nothing", () => {
        const { container } = render(<_IdentityStats rows={rows} labels={labels} />)
        expect(values(container)[2]).toBe(labels.empty)
    })

    it("reads a row that is still loading as loading rather than as empty", () => {
        const both: ReadonlyArray<IdentityStatRow> = [
            { label: "Streak", icon: "streak", isLoading: true, isEmpty: true, value: "" },
        ]
        const { container } = render(<_IdentityStats rows={both} labels={labels} />)
        expect(restingFlags(container)).toEqual(["true"])
        expect(values(container)).toEqual([labels.loading])
    })

    it("draws nothing at all when there are no rows", () => {
        const { container } = render(<_IdentityStats rows={[]} labels={labels} />)
        expect(rowNodes(container).length).toBe(0)
    })
})
