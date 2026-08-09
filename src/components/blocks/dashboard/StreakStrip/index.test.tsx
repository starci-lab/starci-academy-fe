/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { StreakStrip } from "@/components/blocks/dashboard/StreakStrip"

/**
 * What these tests guard: the four things the connected half decides - when the strip rests,
 * when it is genuinely empty rather than merely slow, when the request has FAILED (which SWR
 * keeps reporting as loading while it retries, and which used to leave the strip shimmering for
 * as long as the backend was down), and what the dates read as. The last one is fixed to one
 * locale on purpose, so the same build renders the same text everywhere.
 */

const leaves = vi.hoisted(() => ({
    weekly: {} as Record<string, unknown>,
}))

vi.mock("@/hooks", () => ({
    useQueryMyWeeklyStatsSwr: () => leaves.weekly,
}))

/** A settled week, with the learner active on the last two days. */
const week = {
    streak: 2,
    longestStreak: 9,
    days: [
        { date: "2026-08-03", active: false },
        { date: "2026-08-04", active: false },
        { date: "2026-08-05", active: false },
        { date: "2026-08-06", active: false },
        { date: "2026-08-07", active: false },
        { date: "2026-08-08", active: true },
        { date: "2026-08-09", active: true },
    ],
}

/** The readout line - the `aside` of the split, drawn as a `card-header`. */
const readout = (container: HTMLElement): Element | null =>
    container.querySelector("[data-node='split'] > [data-node='card-header']")

beforeEach(() => {
    leaves.weekly = { isLoading: true }
})

afterEach(() => {
    cleanup()
})

describe("StreakStrip", () => {
    it("rests while the first request is in flight", () => {
        const { container } = render(<StreakStrip />)
        expect(readout(container)?.children[2].getAttribute("data-loading")).toBe("true")
        expect(container.querySelectorAll("[data-part='day']").length).toBe(7)
    })

    it("renders the settled week as seven columns", () => {
        leaves.weekly = { isLoading: false, data: week }
        const { container } = render(<StreakStrip />)
        const columns = [...container.querySelectorAll("[data-part='day']")]
        expect(columns.length).toBe(7)
        expect(columns.map((node) => node.getAttribute("data-active")))
            .toEqual(["false", "false", "false", "false", "false", "true", "true"])
    })

    it("reads the current streak as a figure and the record beside the heading", () => {
        leaves.weekly = { isLoading: false, data: week }
        const { container } = render(<StreakStrip />)
        expect(container.querySelector("[data-component='Badge']")?.textContent).toBe("2 days")
        expect(container.querySelector("[data-node='section-header']")?.children[1].textContent)
            .toBe("Longest 9 days")
    })

    it("formats each date in one fixed locale", () => {
        leaves.weekly = { isLoading: false, data: week }
        const { container } = render(<StreakStrip />)
        expect(container.querySelector("[data-part='date']")?.textContent).toBe("Aug 3, 2026")
    })

    it("calls a week with no activity empty rather than resting on it", () => {
        leaves.weekly = {
            isLoading: false,
            data: { streak: 0, longestStreak: 0, days: week.days.map((day) => ({ ...day, active: false })) },
        }
        const { container } = render(<StreakStrip />)
        expect(readout(container)?.children[2].textContent).toBe("No streak yet")
    })

    it("treats a settled request with no payload as empty, not as loading", () => {
        leaves.weekly = { isLoading: false }
        const { container } = render(<StreakStrip />)
        expect(readout(container)?.children[2].textContent).toBe("No streak yet")
    })

    it("settles a FAILED request rather than resting on a retry that reports itself as loading", () => {
        leaves.weekly = { isLoading: true, error: new Error("unreachable") }
        const { container } = render(<StreakStrip />)
        expect(readout(container)?.children[2].getAttribute("data-loading")).toBe("false")
        expect(readout(container)?.children[2].textContent).toBe("No streak yet")
    })
})
