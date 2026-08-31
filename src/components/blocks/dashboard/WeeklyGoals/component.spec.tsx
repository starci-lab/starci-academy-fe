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
        expect(screen.getByText("Weekly goals")).toBeInTheDocument()
        expect(container.querySelectorAll("a, button")).toHaveLength(0)
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
        expect(screen.getByText("40% this week")).toBeTruthy()
        expect(screen.getByText("40% this week").closest("[data-part=weekly-goals-summary]")).toHaveClass("bg-accent-soft", "px-4", "pt-3", "pb-3")
        expect(screen.getByText("Metric 0")).toBeInTheDocument()
        expect(screen.getAllByRole("progressbar")).toHaveLength(6)
        expect(container.querySelector("[data-part=weekly-goals-grid]")).toHaveClass("grid", "sm:grid-cols-2")
        expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument()
        expect(container.querySelectorAll("[data-part=weekly-goals-grid] svg")).toHaveLength(0)
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
