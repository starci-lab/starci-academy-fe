/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import * as hooks from "@/hooks"
import { ContinueLearning } from "./ContinueLearning"
import { ChangelogList } from "./ChangelogList"
import { CreditStatRow } from "./CreditStatRow"
import { DailyQuest } from "./DailyQuest"
import { JobReadinessWidget } from "./JobReadinessWidget"
import { MyCoursesProgress } from "./MyCoursesProgress"
import { OverviewContributions } from "./OverviewContributions"
import { ProfileIdentityRow } from "./ProfileIdentityRow"
import { RewardStatRow } from "./RewardStatRow"
import { StreakStatRow } from "./StreakStatRow"
import { StreakStrip } from "./StreakStrip"
import { WeeklyChallengeCard } from "./WeeklyChallengeCard"
import { WeeklyGoals } from "./WeeklyGoals"
import { DashboardPageBase } from "@/components/pages/DashboardPage/component"

vi.mock("next-intl", () => ({
    useLocale: () => "en",
    useTranslations: (namespace: string) => (key: string) => `${namespace}:${key}`,
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock("@/hooks", () => ({
    useQueryMeSwr: vi.fn(),
    useMutateClaimWeeklyChallengeRewardSwr: vi.fn(),
    useMutateRedeemRewardSwr: vi.fn(),
    useQueryChangelogEntriesSwr: vi.fn(),
    useQueryMyAiQuotaSwr: vi.fn(),
    useQueryMyContributionCalendarSwr: vi.fn(),
    useQueryMyCoursesSwr: vi.fn(),
    useQueryMyDailyQuestSwr: vi.fn(),
    useQueryMyInProgressChallengesSwr: vi.fn(),
    useQueryMyJobReadinessSwr: vi.fn(),
    useQueryMyKpisSwr: vi.fn(),
    useQueryMyLearnedLessonsSwr: vi.fn(),
    useQueryMyRewardWalletSwr: vi.fn(),
    useQueryResolveRouteSwr: vi.fn(),
    useQueryMyWeeklyStatsSwr: vi.fn(),
    useQueryWeeklyChallengeSwr: vi.fn(),
}))

const unresolved = () => ({
    data: undefined,
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
}) as never

beforeEach(() => {
    vi.stubGlobal("ResizeObserver", class { observe() {}; unobserve() {}; disconnect() {} })
    vi.mocked(hooks.useQueryMeSwr).mockReturnValue(unresolved())
    vi.mocked(hooks.useMutateClaimWeeklyChallengeRewardSwr).mockReturnValue({ trigger: vi.fn() } as never)
    vi.mocked(hooks.useMutateRedeemRewardSwr).mockReturnValue({ trigger: vi.fn() } as never)
    vi.mocked(hooks.useQueryChangelogEntriesSwr).mockReturnValue(unresolved())
    vi.mocked(hooks.useQueryMyAiQuotaSwr).mockReturnValue(unresolved())
    vi.mocked(hooks.useQueryMyContributionCalendarSwr).mockReturnValue(unresolved())
    vi.mocked(hooks.useQueryMyCoursesSwr).mockReturnValue(unresolved())
    vi.mocked(hooks.useQueryMyDailyQuestSwr).mockReturnValue(unresolved())
    vi.mocked(hooks.useQueryMyInProgressChallengesSwr).mockReturnValue(unresolved())
    vi.mocked(hooks.useQueryMyJobReadinessSwr).mockReturnValue(unresolved())
    vi.mocked(hooks.useQueryMyKpisSwr).mockReturnValue(unresolved())
    vi.mocked(hooks.useQueryMyLearnedLessonsSwr).mockReturnValue(unresolved())
    vi.mocked(hooks.useQueryMyRewardWalletSwr).mockReturnValue(unresolved())
    vi.mocked(hooks.useQueryResolveRouteSwr).mockReturnValue({ trigger: vi.fn() } as never)
    vi.mocked(hooks.useQueryMyWeeklyStatsSwr).mockReturnValue(unresolved())
    vi.mocked(hooks.useQueryWeeklyChallengeSwr).mockReturnValue(unresolved())
})

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.unstubAllGlobals()
})

describe("dashboard viewer-key gate", () => {
    it.each([
        ["profile", ProfileIdentityRow],
        ["streak stat", StreakStatRow],
        ["credit stat", CreditStatRow],
        ["reward stat", RewardStatRow],
        ["continue learning", ContinueLearning],
        ["daily quest", DailyQuest],
        ["streak strip", StreakStrip],
        ["weekly goals", WeeklyGoals],
        ["course progress", MyCoursesProgress],
        ["job readiness", JobReadinessWidget],
        ["weekly challenge", WeeklyChallengeCard],
        ["contributions", OverviewContributions],
        ["changelog", ChangelogList],
    ])("keeps %s pending while its request key is unresolved", (_name, Component) => {
        const { container } = render(<Component />)

        expect(container.querySelector("[data-loading=\"true\"]")).not.toBeNull()
        expect(container.querySelector("[data-node=\"empty-notice-stack\"]")).toBeNull()
    })

    it("keeps every overview region mounted while independent requests are unresolved", () => {
        const { getByText } = render(
            <DashboardPageBase props={{ selectedTab: "overview", unavailableMessage: "Unavailable" }} />,
        )

        for (const label of [
            "dashboard:continueLearning.heading",
            "quest:heading",
            "streak:heading",
            "kpi:heading",
            "jobReadiness:title",
            "weeklyChallenge:title",
            "contributions:title",
            "changelog:title",
        ]) {
            expect(getByText(label)).toBeInTheDocument()
        }
    })
})
