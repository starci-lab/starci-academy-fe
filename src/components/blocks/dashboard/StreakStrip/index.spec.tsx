import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useQueryMyWeeklyStatsSwr } from "@/hooks"
import { StreakStrip } from "./index"

const push = vi.fn()

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, number>) =>
        values === undefined ? key : `${key}:${Object.values(values).join("|")}`,
}))

vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/hooks", () => ({ useQueryMyWeeklyStatsSwr: vi.fn() }))

const week = [
    { date: "2026-08-13", active: true },
    { date: "2026-08-14", active: true },
    { date: "2026-08-15", active: false },
    { date: "2026-08-16", active: false },
    { date: "2026-08-17", active: true },
    { date: "2026-08-18", active: true },
    { date: "2026-08-19", active: true },
]

const stub = (over: Record<string, unknown>) => {
    const mutate = vi.fn()
    vi.mocked(useQueryMyWeeklyStatsSwr).mockReturnValue({
        data: undefined,
        error: undefined,
        mutate,
        ...over,
    } as never)
    return mutate
}

const cells = (root: HTMLElement) => root.querySelectorAll("[data-component=\"DayCell\"]")

beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-19T12:00:00.000Z"))
})

afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
})

describe("StreakStrip", () => {
    it("draws the seven days the server sent, dated in the fixed product locale", () => {
        stub({ data: { streak: 3, longestStreak: 9, days: week } })
        const { container } = render(<StreakStrip />)
        expect(Array.from(cells(container), (cell) => cell.querySelector("[data-part=\"weekday\"]")?.textContent)).toEqual([
            "T", "F", "S", "S", "M", "T", "W",
        ])
        expect(Array.from(cells(container), (cell) => cell.querySelector("[data-part=\"date\"]")?.textContent))
            .toEqual([
                "Aug 13, 2026",
                "Aug 14, 2026",
                "Aug 15, 2026",
                "Aug 16, 2026",
                "Aug 17, 2026",
                "Aug 18, 2026",
                "Aug 19, 2026",
            ])
        expect(container.textContent).toContain("current:3")
        expect(container.textContent).toContain("longest:9")
    })

    it("keeps a real-shaped week for a learner the server has no week for", () => {
        stub({ data: null })
        const { container } = render(<StreakStrip />)
        expect(cells(container)).toHaveLength(7)
        expect(Array.from(cells(container), (cell) => cell.querySelector("[data-part=\"date\"]")?.textContent)).toEqual([
            "Aug 13, 2026",
            "Aug 14, 2026",
            "Aug 15, 2026",
            "Aug 16, 2026",
            "Aug 17, 2026",
            "Aug 18, 2026",
            "Aug 19, 2026",
        ])
        expect(container.textContent).toContain("empty")
        expect(container.querySelectorAll("[data-component=\"DayCell\"][data-active=\"true\"]")).toHaveLength(0)
        expect(container.textContent).not.toContain("failed")
    })

    it("sends a learner with no streak yet to the courses they could read", () => {
        stub({ data: { streak: 0, longestStreak: 0, days: week.map((day) => ({ ...day, active: false })) } })
        const { container } = render(<StreakStrip />)
        expect(container.textContent).toContain("empty")
        fireEvent.click(container.querySelector("[data-component=\"Button\"]")!)
        expect(push).toHaveBeenCalledExactlyOnceWith("/courses")
    })

    it("rests the strip while the week is in flight and still offers the way to learn", () => {
        stub({})
        const { container } = render(<StreakStrip />)
        expect(container.querySelector("[data-loading=\"true\"]")).toBeInTheDocument()
        expect(container.textContent).not.toContain("failed")
    })

    it("says the week failed instead of shimmering through the backoff, and refetches on retry", () => {
        const mutate = stub({ error: new Error("down") })
        const { container } = render(<StreakStrip />)
        expect(container.textContent).toContain("failed")
        expect(cells(container)).toHaveLength(0)
        fireEvent.click(screen.getByRole("button", { name: "retry" }))
        expect(mutate).toHaveBeenCalledOnce()
    })

    it("treats a cleared error as no error at all", () => {
        stub({ error: null, data: { streak: 2, longestStreak: 4, days: week } })
        const { container } = render(<StreakStrip />)
        expect(container.textContent).not.toContain("failed")
        expect(cells(container)).toHaveLength(7)
    })
})
