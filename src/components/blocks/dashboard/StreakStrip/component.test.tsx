/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import { vi } from "vitest"
import { _StreakStrip } from "./component"

afterEach(cleanup)

describe("_StreakStrip", () => {
    it("keeps the seven-day run beside the production prompt when activity is zero", () => {
        const learn = vi.fn()
        const days = Array.from({ length: 7 }, (_unused, index) => ({
            id: `2026-08-${index + 1}`,
            weekday: String(index + 1),
            title: `Day ${index + 1}`,
            active: false,
        }))
        const { container } = render(
            <_StreakStrip
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

        expect(container.querySelectorAll("[data-component=\"DayCell\"]")).toHaveLength(7)
        expect(container.querySelector("[data-component=\"StatRow\"]")).toBeNull()
        expect(container.textContent).toContain("Read content to start your streak")
        fireEvent.click(container.querySelector("[data-component=\"Button\"]")!)
        expect(learn).toHaveBeenCalledOnce()
        expect(container.querySelector("[data-node=\"empty-notice-stack\"]")).toBeNull()
    })

    it("does not invent a tiny business glyph beside the settled streak facts", () => {
        const { container } = render(
            <_StreakStrip
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

        expect(container.querySelector("[data-node=\"streak-active-summary\"] [data-component=\"Icon\"]")).toBeNull()
    })

    it("rests the same seven-day prompt shape while pending", () => {
        const { container } = render(
            <_StreakStrip
                state="pending"
                props={{ label: "Streak", message: "Read content", actionLabel: "Learn content" }}
            />,
        )

        expect(container.querySelectorAll("[data-component=\"DayCell\"]")).toHaveLength(7)
        expect(container.querySelector("[data-component=\"Badge\"][data-loading=\"true\"]")).not.toBeNull()
        expect(container.querySelector("[data-component=\"Text\"][data-loading=\"true\"]")).not.toBeNull()
    })
})
