import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useOverviewEvidence } from "./useOverviewEvidence"
import { usePublicWeeklyStats } from "./usePublicWeeklyStats"
import { OverviewContributions } from "./OverviewContributions"

vi.mock("next-intl", () => ({
    useTranslations:
    () => (key: string, values?: Record<string, string | number>) =>
        values === undefined ? key : `${key}:${Object.values(values).join("|")}`,
}))
vi.mock("./useOverviewEvidence", () => ({ useOverviewEvidence: vi.fn() }))
vi.mock("./usePublicWeeklyStats", () => ({ usePublicWeeklyStats: vi.fn() }))

type Day = {
  readonly date: string;
  readonly total: number;
  readonly contents: number;
  readonly challenges: number;
  readonly milestones: number;
};

const thisYear = new Date().getFullYear()
const lastYear = thisYear - 1

const day = (date: string, total: number): Day => ({
    date,
    total,
    contents: total,
    challenges: 0,
    milestones: 0,
})

type CalendarEvidence = {
  readonly data?: ReadonlyArray<Day>;
  readonly error?: Error;
  readonly isLoading?: boolean;
};

type WeeklyEvidence = {
  readonly data?: { readonly streak: number; readonly longestStreak: number };
  readonly error?: Error;
};

const stubCalendar = (over: CalendarEvidence) => {
    vi.mocked(useOverviewEvidence).mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        ...over,
    } as never)
}

const stubWeekly = (over: WeeklyEvidence) => {
    vi.mocked(usePublicWeeklyStats).mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
        ...over,
    } as never)
}

afterEach(() => {
    vi.clearAllMocks()
})

describe("OverviewContributions", () => {
    it("sums the year's contributions into the heatmap caption beside the streak record", () => {
        stubCalendar({
            data: [day(`${thisYear}-08-12`, 10), day(`${thisYear}-08-13`, 6)],
        })
        stubWeekly({ data: { streak: 3, longestStreak: 8 } })
        render(<OverviewContributions />)

        expect(
            screen.getByRole("heading", {
                name: "profile.evidence.contributions.label",
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("tablist", {
                name: `contributions.year:16|${thisYear}`,
            }),
        ).toBeInTheDocument()
        expect(screen.getByText("profile.overview.streak:3|8")).toBeInTheDocument()
        expect(screen.getByText(/profile\.overview\.streak/)).toBeInTheDocument()
        expect(screen.getByRole("tab", { name: String(thisYear) })).toHaveAttribute(
            "aria-selected",
            "true",
        )
        expect(screen.getByRole("tab", { name: String(lastYear) })).toHaveAttribute(
            "aria-selected",
            "false",
        )
    })

    it("refetches the calendar for the year the reader picks", () => {
        stubCalendar({ data: [day(`${thisYear}-08-12`, 10)] })
        stubWeekly({ data: { streak: 3, longestStreak: 8 } })
        render(<OverviewContributions />)

        fireEvent.click(screen.getByText(String(lastYear)))
        expect(screen.getByRole("tab", { name: String(lastYear) })).toHaveAttribute(
            "aria-selected",
            "true",
        )
        expect(useOverviewEvidence).toHaveBeenLastCalledWith("contributions", {
            year: lastYear,
        })
    })

    it("reports zero streak days when the weekly record has not arrived yet", () => {
        stubCalendar({ data: [] })
        stubWeekly({})
        render(<OverviewContributions />)

        expect(screen.getByText("profile.overview.streak:0|0")).toBeInTheDocument()
        expect(
            screen.getByRole("tablist", { name: `contributions.year:0|${thisYear}` }),
        ).toBeInTheDocument()
    })

    it("drops the streak caption entirely when the weekly request fails", () => {
        stubCalendar({ data: [day(`${thisYear}-01-02`, 1)] })
        stubWeekly({ error: new Error("down") })
        render(<OverviewContributions />)

        expect(screen.queryByText(/profile\.overview\.streak/)).toBeNull()
        expect(
            screen.getByRole("tablist", { name: `contributions.year:1|${thisYear}` }),
        ).toBeInTheDocument()
    })

    it("says the calendar failed instead of captioning a year of zero contributions", () => {
        stubCalendar({ error: new Error("down") })
        stubWeekly({ data: { streak: 0, longestStreak: 0 } })
        render(<OverviewContributions />)

        expect(
            screen.getByRole("tablist", { name: "profile.evidence.error" }),
        ).toBeInTheDocument()
        expect(screen.queryByText("contributions.year")).not.toBeInTheDocument()
    })

    it("rests the heatmap while the year of contributions is in flight", () => {
        stubCalendar({ isLoading: true })
        stubWeekly({ data: { streak: 0, longestStreak: 0 } })
        render(<OverviewContributions />)

        expect(screen.getByRole("tablist")).toBeInTheDocument()
        expect(
            screen.getByRole("tablist", { name: `contributions.year:0|${thisYear}` }),
        ).toBeInTheDocument()
    })
})
