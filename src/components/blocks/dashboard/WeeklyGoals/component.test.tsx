/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { _WeeklyGoals } from "./component"

/**
 * What these tests guard.
 *
 * `unset` IS THE POINT OF THIS BLOCK. The server sends every metric whether or not a target was
 * chosen, so "no goals" never arrives as an empty list - it arrives as six rows with no
 * denominator. A block that rendered them anyway would tell a reader they had finished a week they
 * never started.
 *
 * THE SECOND TEST IS A BUG THAT SHIPPED. The `unset` state drew its invitation with no `on`
 * attached, so the one control on a card whose entire content is "go and set a target" led
 * nowhere. It type-checked, it rendered, and it was invisible to every other test.
 */

afterEach(cleanup)

describe("_WeeklyGoals", () => {
    it("invites the reader to set a target when none is set", () => {
        render(
            <_WeeklyGoals
                state="unset"
                props={{ label: "Weekly goals", editLabel: "Edit", prompt: "Set weekly targets" }}
                on={{ edit: () => {} }}
            />,
        )
        expect(screen.getByText("Set weekly targets")).toBeTruthy()
    })

    it("gives that invitation somewhere to go", () => {
        const edit = vi.fn()
        const { container } = render(
            <_WeeklyGoals
                state="unset"
                props={{ label: "Weekly goals", editLabel: "Edit", prompt: "Set weekly targets" }}
                on={{ edit }}
            />,
        )
        const link = container.querySelector("[data-component=\"SeeMoreLink\"]")
        expect(link).not.toBeNull()
        expect(link?.textContent).toContain("Edit")
    })

    it("withholds the way out while the week is still resting", () => {
        const { container } = render(<_WeeklyGoals state="pending" props={{ label: "Weekly goals" }} />)
        // A control that leads nowhere yet is worse than one that is not there.
        expect(container.querySelector("[data-component=\"SeeMoreLink\"]")).toBeNull()
    })

    it("draws the week's own figure in the label line, not among the rows", () => {
        const { container } = render(
            <_WeeklyGoals
                state="ready"
                props={{
                    label: "Weekly goals",
                    editLabel: "Edit",
                    summary: "40% this week",
                    rows: [{ id: "lessons", title: "Content", percent: 40, percentText: "2/5" }],
                }}
                on={{ edit: () => {} }}
            />,
        )
        const labelLine = container.querySelector("[data-node=\"title-with-end-action\"]")
        expect(labelLine?.textContent).toContain("Weekly goals")
        // The summary is a fact ABOUT the set, so it must not queue up as a seventh metric.
        const rows = container.querySelectorAll("[data-component=\"LabelledProgressRow\"]")
        expect(rows).toHaveLength(1)
    })

    it("offers a way back when the week could not be read", () => {
        const retry = vi.fn()
        render(
            <_WeeklyGoals
                state="failed"
                props={{ label: "Weekly goals", message: "Could not load", retryLabel: "Retry" }}
                on={{ retry }}
            />,
        )
        expect(screen.getByText("Could not load")).toBeTruthy()
        expect(screen.getByText("Retry")).toBeTruthy()
    })
})
