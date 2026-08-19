/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { WeeklyGoalsBase } from "./component"

/**
 * What these tests guard.
 *
 * The board has six fixed product metrics. Loading and settled data keep that exact shape; missing
 * custom targets are resolved by the connected half rather than replacing the board with a giant
 * empty notice.
 */

afterEach(cleanup)

describe("WeeklyGoalsBase", () => {
    it("keeps six metric rows while the week is still resting", () => {
        const { container } = render(<WeeklyGoalsBase state="pending" props={{ label: "Weekly goals" }} />)
        expect(container.querySelectorAll("[data-node=\"label-fact-over-progress\"]")).toHaveLength(6)
        expect(container.querySelectorAll(
            "[data-node=\"label-fact-over-progress\"] [data-component=\"Text\"][data-loading=\"true\"]",
        )).toHaveLength(12)
        expect(container.querySelectorAll(
            "[data-node=\"label-fact-over-progress\"] [data-component=\"Progress\"][data-loading=\"true\"]",
        )).toHaveLength(6)
        expect(container.querySelector(
            "[data-node=\"label-fact-over-progress\"] [data-component=\"Icon\"]",
        )).toBeNull()
        expect(container.querySelector("[data-component=\"SeeMoreLink\"]")).toBeNull()
    })

    it("draws the summary above the legacy two-column bordered grid", () => {
        const { container } = render(
            <WeeklyGoalsBase
                state="ready"
                props={{
                    label: "Weekly goals",
                    editLabel: "Edit",
                    summary: "40% this week",
                    rows: Array.from({ length: 6 }, (_unused, index) => ({
                        id: `metric-${index}`,
                        title: `Metric ${index}`,
                        percent: 40,
                        percentText: "2/5",
                    })),
                }}
                on={{ edit: () => {} }}
            />,
        )
        const grid = container.querySelector("[data-node=\"bordered-goal-grid\"]")
        expect(grid?.className).toContain("grid-cols-2")
        expect(grid?.className).toContain("border")
        expect(screen.getByText("40% this week")).toBeTruthy()
        const rows = container.querySelectorAll("[data-node=\"label-fact-over-progress\"]")
        expect(rows).toHaveLength(6)
        expect(grid?.querySelector("[data-component=\"Icon\"]")).toBeNull()
    })

    it("offers a way back when the week could not be read", () => {
        const retry = vi.fn()
        render(
            <WeeklyGoalsBase
                state="failed"
                props={{ label: "Weekly goals", message: "Could not load", retryLabel: "Retry" }}
                on={{ retry }}
            />,
        )
        expect(screen.getByText("Could not load")).toBeTruthy()
        expect(screen.getByText("Retry")).toBeTruthy()
    })
})
