import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ContributionCalendar } from "."

class TestResizeObserver implements ResizeObserver {
    observe() { /* jsdom has no layout observer; this test asserts the declared full-width contract. */ }
    unobserve() { /* no-op */ }
    disconnect() { /* no-op */ }
}

globalThis.ResizeObserver = TestResizeObserver

describe("ContributionCalendar", () => {
    it("draws the whole year, selector, intensity key and streak caption", () => {
        const selectYear = vi.fn()
        const { container } = render(<ContributionCalendar props={{
            year: 2026,
            years: [2026, 2025, 2024],
            totalLabel: "16 activities in 2026",
            streakLabel: "3 current, 8 longest",
            lessLabel: "Less",
            moreLabel: "More",
            monthLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            weekdayLabels: ["", "Mon", "", "Wed", "", "Fri", ""],
            days: [{ date: "2026-08-12", count: 10, label: "12 Aug, 10 activities" }],
        }} on={{ selectYear }} />)

        expect(container.querySelectorAll("[data-part=\"calendar-day\"]").length).toBeGreaterThanOrEqual(365)
        expect(container.querySelector("[data-date=\"2026-08-12\"]")).toHaveAttribute("data-count", "10")
        expect(container.querySelectorAll("[data-part=\"intensity-legend\"] [data-level]")).toHaveLength(5)
        expect(screen.getByText("3 current, 8 longest")).toBeInTheDocument()
        expect(screen.getByText("3 current, 8 longest").closest("[data-component=\"Text\"]")?.querySelector("[data-component=\"Icon\"]")).toBeNull()
        expect(screen.getByRole("tablist", { name: "16 activities in 2026" })).toHaveClass("w-full")
        expect(screen.getByRole("tablist", { name: "16 activities in 2026" }).closest("[data-hierarchy=\"primary\"]")).toHaveClass("w-full")
        expect(screen.getByRole("tab", { name: "2026" })).toHaveAttribute("aria-selected", "true")
        expect(screen.getByRole("tab", { name: "2025" })).toHaveAttribute("aria-selected", "false")
        fireEvent.click(screen.getByText("2025"))
        expect(selectYear).toHaveBeenCalledWith(2025)
        fireEvent.click(screen.getByText("2026"))
        expect(selectYear).toHaveBeenCalledWith(2026)
    })
})
