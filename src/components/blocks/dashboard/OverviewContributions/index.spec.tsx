import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useQueryMyContributionCalendarSwr } from "@/hooks"
import { OverviewContributions } from "./index"

vi.mock("next-intl", () => ({
    useLocale: () => "en-US",
    useTranslations: () => (key: string, values?: Record<string, number>) =>
        values === undefined ? key : `${key}:${Object.values(values).join("|")}`,
}))

vi.mock("@/hooks", () => ({ useQueryMyContributionCalendarSwr: vi.fn() }))

const stub = (over: Record<string, unknown>) => {
    vi.mocked(useQueryMyContributionCalendarSwr).mockReturnValue({
        data: undefined,
        error: undefined,
        ...over,
    } as never)
}

/** What the block asked the server for, most recent call last. */
const askedYears = () => vi.mocked(useQueryMyContributionCalendarSwr).mock.calls.map(([year]) => year)

beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-19T12:00:00.000Z"))
})

afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
})

describe("OverviewContributions", () => {
    it("opens on this year and offers the two years before it", () => {
        stub({ data: [{ date: "2026-08-12", total: 3 }] })
        render(<OverviewContributions />)
        expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual(["2026", "2025", "2024"])
        expect(screen.getByRole("tab", { name: "2026" })).toHaveAttribute("aria-selected", "true")
        expect(askedYears()).toEqual([2026])
    })

    it("counts the whole year's activity into the summary line", () => {
        stub({ data: [
            { date: "2026-08-12", total: 3 },
            { date: "2026-08-13", total: 4 },
        ] })
        const { container } = render(<OverviewContributions />)
        expect(container.textContent).toContain("year:7|2026")
        expect(container.querySelector("[data-date=\"2026-08-12\"]")).toHaveAttribute("data-count", "3")
    })

    it("counts the longest unbroken run, and starts again after a missed day", () => {
        stub({ data: [
            { date: "2026-03-01", total: 1 },
            { date: "2026-03-02", total: 2 },
            { date: "2026-03-03", total: 1 },
            { date: "2026-03-05", total: 1 },
            { date: "2026-03-06", total: 1 },
        ] })
        const { container } = render(<OverviewContributions />)
        expect(container.textContent).toContain("streak:3")
    })

    it("leaves a day with no activity out of the run it counts", () => {
        stub({ data: [
            { date: "2026-03-01", total: 1 },
            { date: "2026-03-02", total: 0 },
            { date: "2026-03-03", total: 1 },
        ] })
        const { container } = render(<OverviewContributions />)
        expect(container.textContent).toContain("streak:1")
    })

    it("asks the server about the year the reader picked and keeps its labels", () => {
        stub({ data: [{ date: "2026-08-12", total: 3 }] })
        const { container } = render(<OverviewContributions />)
        fireEvent.click(screen.getByText("2025"))
        expect(askedYears().at(-1)).toBe(2025)
        expect(screen.getByRole("tab", { name: "2025" })).toHaveAttribute("aria-selected", "true")
        expect(container.textContent).toContain("year:3|2025")
    })

    it("names the months and weekdays in the viewer's own locale", () => {
        stub({ data: [{ date: "2026-08-12", total: 3 }] })
        const { container } = render(<OverviewContributions />)
        expect(container.textContent).toContain("Jan")
        expect(container.textContent).toContain("Dec")
        expect(container.textContent).toContain("Wed")
    })

    it("says the year is empty instead of drawing a plot of nothing", () => {
        stub({ data: [] })
        const { container } = render(<OverviewContributions />)
        expect(container.textContent).toContain("empty:2026")
        expect(container.querySelector("[data-count]:not([data-count=\"0\"])")).toBeNull()
    })

    it("says the calendar failed rather than reading zero activity as a real year", () => {
        stub({ error: new Error("down") })
        const { container } = render(<OverviewContributions />)
        expect(container.textContent).toContain("failed")
    })

    it("keeps the settled year on screen when a revalidation fails behind it", () => {
        stub({ data: [{ date: "2026-08-12", total: 3 }], error: new Error("stale") })
        const { container } = render(<OverviewContributions />)
        expect(container.textContent).not.toContain("failed")
        expect(container.textContent).toContain("year:3|2026")
    })

    it("rests the calendar while the year is in flight", () => {
        stub({})
        const { container } = render(<OverviewContributions />)
        expect(container.querySelector("[data-loading=\"true\"]")).toBeInTheDocument()
        expect(container.querySelector("[data-count]:not([data-count=\"0\"])")).toBeNull()
    })
})
