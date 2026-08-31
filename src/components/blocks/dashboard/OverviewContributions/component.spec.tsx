import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { OverviewContributionsBase } from "./component"

const props = {
    label: "Learning activity",
    year: 2026,
    years: [2026, 2025, 2024],
    yearLabel: "16 activities in 2026",
    streakLabel: "3 current, 8 longest",
    lessLabel: "Less",
    moreLabel: "More",
    emptyMessage: "No activity in 2026",
    errorMessage: "Could not load activity",
    monthLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    weekdayLabels: ["", "Mon", "", "Wed", "", "Fri", ""],
    days: [{ date: "2026-08-12", count: 2, label: "12 Aug, 2 activities" }],
} as const

describe("OverviewContributionsBase", () => {
    it("keeps selector, full calendar, intensity legend and streak in one flush surface", () => {
        const { container } = render(<OverviewContributionsBase state="ready" props={props} />)
        expect(screen.getByText("16 activities in 2026")).toBeInTheDocument()
        expect(screen.getByText("3 current, 8 longest")).toBeInTheDocument()
        expect(container.querySelector("[data-part=\"contribution-header\"]")).toHaveClass("p-4", "pb-3")
        expect(container.querySelector("[data-part=\"contribution-footer\"]")).toHaveClass("px-4", "pb-4", "pt-3")
        expect(container.querySelectorAll("[data-part=\"calendar-day\"]").length).toBeGreaterThanOrEqual(365)
        expect(container.querySelector("[data-date=\"2026-08-12\"]")).toHaveAccessibleName("12 Aug, 2 activities")
        expect(container.querySelectorAll("[data-part=\"intensity-legend\"] [data-level]")).toHaveLength(5)
    })

    it("reports a year choice instead of owning selected-year state", () => {
        const selectYear = vi.fn()
        render(<OverviewContributionsBase state="ready" props={props} on={{ selectYear }} />)
        fireEvent.click(screen.getByText("2025"))
        expect(selectYear).toHaveBeenCalledWith(2025)
    })

    it("renders a zero-activity year as a real calendar", () => {
        const { container } = render(<OverviewContributionsBase state="empty" props={props} />)
        expect(screen.getByText("No activity in 2026")).toBeInTheDocument()
        expect(container.querySelectorAll("[data-part=\"calendar-day\"]").length).toBeGreaterThanOrEqual(365)
    })
})
