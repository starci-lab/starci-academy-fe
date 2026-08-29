/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import { vi } from "vitest"
import { StreakStripBase } from "./component"

afterEach(cleanup)

describe("StreakStripBase", () => {
    it("keeps the seven-day run beside the production prompt when activity is zero", () => {
        const learn = vi.fn()
        const days = Array.from({ length: 7 }, (_unused, index) => ({
            id: `2026-08-${index + 1}`,
            weekday: String(index + 1),
            title: `Day ${index + 1}`,
            active: false,
        }))
        const { container } = render(
            <StreakStripBase
                state="ready"
                props={{
                    label: "Streak",
                    streak: 0,
                    record: "Longest: 0",
                    days,
                    current: "0 days",
                    emptyMessage: "Read content to start your streak",
                    actionLabel: "Learn content",
                    nudge: "Learn today",
                }}
                on={{ learn }}
            />,
        )

        expect(container.querySelectorAll("li")).toHaveLength(7)
        expect(container.querySelector("[data-part=\"streak-primary\"]")).toHaveClass("flex", "sm:flex-row", "sm:justify-between")
        expect(container.querySelector("[data-part=\"streak-week-run\"]")).toHaveClass("flex", "gap-3")
        expect(container.querySelector("[role=\"row\"]")).toBeNull()
        expect(container.textContent).toContain("Read content to start your streak")
        fireEvent.click(container.querySelector("button")!)
        expect(learn).toHaveBeenCalledOnce()
        expect(container.textContent).not.toContain("empty-notice")
    })

    it("does not invent a tiny business glyph beside the settled streak facts", () => {
        const { container } = render(
            <StreakStripBase
                state="ready"
                props={{
                    label: "Streak",
                    streak: 5,
                    record: "Longest 5",
                    days: Array.from({ length: 7 }, (_unused, index) => ({
                        id: `day-${index}`,
                        weekday: String(index),
                        title: String(index),
                        active: index > 1,
                    })),
                    current: "5-day streak",
                    emptyMessage: "Read content",
                    actionLabel: "Learn content",
                    nudge: "Learn today",
                }}
            />,
        )

        expect(container.querySelector("svg")).toBeNull()
    })

    it("rests the same seven-day prompt shape while pending", () => {
        const { container } = render(
            <StreakStripBase
                state="pending"
                props={{ label: "Streak", message: "Read content", actionLabel: "Learn content" }}
            />,
        )

        expect(container.querySelectorAll("li")).toHaveLength(7)
        expect(container.querySelectorAll("[data-loading=\"true\"]").length).toBeGreaterThan(0)
    })
})
