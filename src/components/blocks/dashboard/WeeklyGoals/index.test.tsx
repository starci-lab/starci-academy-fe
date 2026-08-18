/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import { useQueryMyKpisSwr } from "@/hooks"
import { WeeklyGoals } from "./index"

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, number>) => {
        if (key === "summary") return `${values?.percent}% · ${values?.completed}/${values?.total}`
        return key
    },
}))

vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("@/hooks", () => ({ useQueryMyKpisSwr: vi.fn() }))

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
})

describe("WeeklyGoals", () => {
    it("resolves an unset payload to all six legacy default metrics", () => {
        vi.mocked(useQueryMyKpisSwr).mockReturnValue({
            data: {
                items: [],
                composite: null,
                resetAt: null,
            },
            error: undefined,
            isLoading: false,
            mutate: vi.fn(),
        } as never)

        const { container } = render(<WeeklyGoals />)
        const rows = container.querySelectorAll("[data-node=\"label-fact-over-progress\"]")
        expect(rows).toHaveLength(6)
        expect(Array.from(rows, (row) => row.textContent)).toEqual([
            "labels.lessons0/5",
            "labels.studyDays0/5",
            "labels.challenges0/3",
            "labels.coding0/3",
            "labels.flashcards0/20",
            "labels.milestones0/2",
        ])
        expect(container.querySelector("[data-node=\"empty-notice-stack\"]")).toBeNull()
    })
})
