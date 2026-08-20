/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { useQueryMyKpisSwr } from "@/hooks"
import { WeeklyGoals } from "./index"

const push = vi.fn()

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, number>) => {
        if (key === "summary") return `${values?.percent}% · ${values?.completed}/${values?.total}`
        if (key === "resetIn") return `${values?.days}d ${values?.hours}h`
        return key
    },
}))

vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/hooks", () => ({ useQueryMyKpisSwr: vi.fn() }))

const stub = (over: Record<string, unknown>) => {
    const mutate = vi.fn()
    vi.mocked(useQueryMyKpisSwr).mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate,
        ...over,
    } as never)
    return mutate
}

const rows = (root: HTMLElement) =>
    Array.from(root.querySelectorAll("[data-node=\"label-fact-over-progress\"]"), (row) => row.textContent)

beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-08-19T12:00:00.000Z"))
})

afterEach(() => {
    vi.useRealTimers()
    cleanup()
    vi.clearAllMocks()
})

describe("WeeklyGoals", () => {
    it("resolves an unset payload to all six legacy default metrics", () => {
        stub({ data: { items: [], composite: null, resetAt: null } })

        const { container } = render(<WeeklyGoals />)
        expect(rows(container)).toEqual([
            "labels.lessons0/5",
            "labels.studyDays0/5",
            "labels.challenges0/3",
            "labels.coding0/3",
            "labels.flashcards0/20",
            "labels.milestones0/2",
        ])
        expect(container.querySelector("[data-node=\"empty-notice-stack\"]")).toBeNull()
        expect(container.textContent).toContain("0% · 0/6")
    })

    it("still draws the six product metrics for a learner who has no week yet", () => {
        stub({ data: null })

        const { container } = render(<WeeklyGoals />)
        expect(rows(container)).toEqual([
            "labels.lessons0/5",
            "labels.studyDays0/5",
            "labels.challenges0/3",
            "labels.coding0/3",
            "labels.flashcards0/20",
            "labels.milestones0/2",
        ])
        expect(container.textContent).toContain("0% · 0/6")
        expect(container.textContent).not.toContain("d ")
    })

    it("keeps a learner's own targets and counts a met metric as complete", () => {
        stub({ data: {
            items: [
                { key: "lessons", current: 8, target: 8 },
                { key: "studyDays", current: 2, target: 4 },
                { key: "challenges", current: 9, target: 3 },
            ],
            composite: null,
            resetAt: null,
        } })

        const { container } = render(<WeeklyGoals />)
        expect(rows(container).slice(0, 3)).toEqual([
            "labels.lessons8/8",
            "labels.studyDays2/4",
            "labels.challenges9/3",
        ])
        expect(container.textContent).toContain("· 2/6")
    })

    it("never lets an overshoot pull the whole week past its own target", () => {
        stub({ data: {
            items: [{ key: "lessons", current: 500, target: 5 }],
            composite: null,
            resetAt: null,
        } })

        const { container } = render(<WeeklyGoals />)
        expect(rows(container)[0]).toBe("labels.lessons500/5")
        expect(container.textContent).toContain("13% · 1/6")
    })

    it("reads a metric with no target at all as no progress rather than as infinite progress", () => {
        stub({ data: {
            items: [
                { key: "lessons", current: 3, target: 0 },
                { key: "studyDays", current: 3, target: 0 },
                { key: "challenges", current: 3, target: 0 },
                { key: "coding", current: 3, target: 0 },
                { key: "flashcards", current: 3, target: 0 },
                { key: "milestones", current: 3, target: 0 },
            ],
            composite: null,
            resetAt: null,
        } })

        const { container } = render(<WeeklyGoals />)
        expect(rows(container)[0]).toBe("labels.lessons3/0")
        expect(container.textContent).toContain("0% · 0/6")
    })

    it("says how long is left when the roll-over is still ahead", () => {
        stub({ data: { items: [], composite: null, resetAt: "2026-08-21T15:00:00.000Z" } })

        const { container } = render(<WeeklyGoals />)
        expect(container.textContent).toContain("0% · 0/6 · 2d 3h")
    })

    it("says nothing about a roll-over that has already happened", () => {
        stub({ data: { items: [], composite: null, resetAt: "2026-08-18T12:00:00.000Z" } })

        const { container } = render(<WeeklyGoals />)
        expect(container.textContent).toContain("0% · 0/6")
        expect(container.textContent).not.toContain("d ")
    })

    it("says nothing about a roll-over instant it cannot read", () => {
        stub({ data: { items: [], composite: null, resetAt: "not a date" } })

        const { container } = render(<WeeklyGoals />)
        expect(container.textContent).toContain("0% · 0/6")
        expect(container.textContent).not.toContain("d ")
    })

    it("sends the reader to the targets page from the edit control", () => {
        stub({ data: { items: [], composite: null, resetAt: null } })

        render(<WeeklyGoals />)
        fireEvent.click(screen.getByRole("link", { name: "edit" }))
        expect(push).toHaveBeenCalledExactlyOnceWith("/kpi")
    })

    it("rests the board while the week is in flight", () => {
        stub({})

        const { container } = render(<WeeklyGoals />)
        expect(container.querySelector("[data-loading=\"true\"]")).toBeInTheDocument()
        expect(container.textContent).not.toContain("failed")
    })

    it("says the week failed and refetches on the retry press", () => {
        const mutate = stub({ error: new Error("down") })

        const { container } = render(<WeeklyGoals />)
        expect(container.textContent).toContain("failed")
        fireEvent.click(screen.getByRole("button", { name: "retry" }))
        expect(mutate).toHaveBeenCalledOnce()
    })

    it("treats a cleared error as no error at all", () => {
        stub({ error: null, data: { items: [], composite: null, resetAt: null } })

        const { container } = render(<WeeklyGoals />)
        expect(container.textContent).not.toContain("failed")
        expect(rows(container)).toHaveLength(6)
    })
})
