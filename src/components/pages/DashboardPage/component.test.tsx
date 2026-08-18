import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _DashboardPage } from "./component"

/**
 * What these tests guard.
 *
 * The dashboard owns no request; what it owns is which panel the navbar's `?tab=` contract selects
 * and, for the overview, the legacy reading order of its eight blocks. A tab nobody published must
 * settle as a notice rather than as an empty main, and every named tab must reach exactly one panel.
 */

const { stub } = vi.hoisted(() => ({
    stub: (name: string) => ({ [name]: () => <div data-testid={name} /> }),
}))

vi.mock("@/components/blocks/dashboard/IdentityRail", () => stub("IdentityRail"))
vi.mock("@/components/blocks/dashboard/QuickActions", () => stub("QuickActions"))
vi.mock("@/components/blocks/dashboard/ContinueLearning", () => stub("ContinueLearning"))
vi.mock("@/components/blocks/dashboard/DailyQuest", () => stub("DailyQuest"))
vi.mock("@/components/blocks/dashboard/StreakStrip", () => stub("StreakStrip"))
vi.mock("@/components/blocks/dashboard/WeeklyGoals", () => stub("WeeklyGoals"))
vi.mock("@/components/blocks/dashboard/JobReadinessWidget", () => stub("JobReadinessWidget"))
vi.mock("@/components/blocks/dashboard/WeeklyChallengeCard", () => stub("WeeklyChallengeCard"))
vi.mock("@/components/blocks/dashboard/OverviewContributions", () => stub("OverviewContributions"))
vi.mock("@/components/blocks/dashboard/ChangelogList", () => stub("ChangelogList"))
vi.mock("@/components/blocks/dashboard/ExploreTab", () => stub("ExploreTab"))
vi.mock("@/components/blocks/dashboard/CoursesTab", () => stub("CoursesTab"))
vi.mock("@/components/blocks/dashboard/CommunityTab", () => stub("CommunityTab"))

const unavailableMessage = "That dashboard panel is not available."

describe("_DashboardPage", () => {
    it("keeps the identity rail above the shortcuts in every panel", () => {
        const { container } = render(<_DashboardPage props={{ selectedTab: "overview", unavailableMessage }} />)

        const rail = container.querySelector("[data-node=\"dashboard-rail\"]")
        const railText = rail?.innerHTML ?? ""
        expect(railText.indexOf("IdentityRail")).toBeLessThan(railText.indexOf("QuickActions"))
        expect(screen.getByTestId("IdentityRail")).toBeInTheDocument()
        expect(screen.getByTestId("QuickActions")).toBeInTheDocument()
    })

    it("draws the eight legacy overview blocks in their published reading order", () => {
        const { container } = render(<_DashboardPage props={{ selectedTab: "overview", unavailableMessage }} />)

        const main = container.querySelector("[data-node=\"dashboard-main\"]")
        const order = Array.from(main?.querySelectorAll("[data-testid]") ?? []).map((node) => node.getAttribute("data-testid"))
        expect(order).toEqual([
            "ContinueLearning",
            "DailyQuest",
            "StreakStrip",
            "WeeklyGoals",
            "JobReadinessWidget",
            "WeeklyChallengeCard",
            "OverviewContributions",
            "ChangelogList",
        ])
    })

    it("reaches the explore panel and nothing else", () => {
        render(<_DashboardPage props={{ selectedTab: "explore", unavailableMessage }} />)

        expect(screen.getByTestId("ExploreTab")).toBeInTheDocument()
        expect(screen.queryByTestId("ContinueLearning")).not.toBeInTheDocument()
        expect(screen.queryByText(unavailableMessage)).not.toBeInTheDocument()
    })

    it("reaches the courses panel and nothing else", () => {
        render(<_DashboardPage props={{ selectedTab: "courses", unavailableMessage }} />)

        expect(screen.getByTestId("CoursesTab")).toBeInTheDocument()
        expect(screen.queryByTestId("ExploreTab")).not.toBeInTheDocument()
    })

    it("reaches the community panel and nothing else", () => {
        render(<_DashboardPage props={{ selectedTab: "community", unavailableMessage }} />)

        expect(screen.getByTestId("CommunityTab")).toBeInTheDocument()
        expect(screen.queryByTestId("CoursesTab")).not.toBeInTheDocument()
    })

    it("settles an unpublished tab as a centred notice instead of an empty main", () => {
        const { container } = render(<_DashboardPage props={{ selectedTab: "invoices", unavailableMessage }} />)

        expect(screen.getByText(unavailableMessage)).toBeInTheDocument()
        expect(container.querySelector("[data-node=\"centred-empty-notice\"]")).not.toBeNull()
        expect(container.querySelector("[data-node=\"dashboard-main\"]")).toBeNull()
        expect(screen.getByTestId("IdentityRail")).toBeInTheDocument()
    })
})
