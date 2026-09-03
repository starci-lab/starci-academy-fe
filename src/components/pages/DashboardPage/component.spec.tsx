import { fireEvent, render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"
import { DashboardPageBase } from "./component"

/**
 * What these tests guard.
 *
 * The dashboard owns no request; what it owns is which panel the navbar's `?tab=` value selects
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
vi.mock("@/components/blocks/dashboard/FeedExplorer", () => stub("FeedExplorer"))
vi.mock("@/components/blocks/dashboard/CoursesTab", () => stub("CoursesTab"))
vi.mock("@/components/blocks/dashboard/CommunityTab", () => stub("CommunityTab"))
vi.mock("@/components/blocks/dashboard/WhoToFollow", () => stub("WhoToFollow"))
vi.mock("@/components/blocks/dashboard/UpcomingLivestreamCard", () => stub("UpcomingLivestreamCard"))
type DrawerStubProps = { readonly inset?: "default" | "none"; readonly isOpen: boolean; readonly isTitleEmpty?: boolean; readonly title: string; readonly onDismiss: () => void; readonly children: ReactNode }
vi.mock("@/components/branches/DrawerBranch", () => ({
    DrawerBranch: (input: DrawerStubProps) => input.isOpen ? <aside data-inset={input.inset} data-testid="dashboard-rail-drawer">{input.isTitleEmpty === true ? null : <span>{input.title}</span>}{input.children}<button onClick={input.onDismiss}>dismiss drawer</button></aside> : null,
}))

const unavailableMessage = "That dashboard panel is not available."
const railLabel = "Your standing"

describe("DashboardPageBase", () => {
    it("keeps the identity rail above the shortcuts in every panel", () => {
        const { container } = render(<DashboardPageBase props={{ selectedTab: "overview", unavailableMessage, railLabel }} />)

        const rail = container.querySelector("[data-dashboard-rail=\"true\"]")
        const railText = rail?.innerHTML ?? ""
        expect(rail?.querySelector("[data-grammar-rail-mode='sticky']")).toBeInTheDocument()
        expect(railText.indexOf("IdentityRail")).toBeLessThan(railText.indexOf("QuickActions"))
        expect(screen.getByTestId("IdentityRail")).toBeInTheDocument()
        expect(screen.getByTestId("QuickActions")).toBeInTheDocument()
    })

    it("draws the seven primary overview blocks in their published reading order", () => {
        const { container } = render(<DashboardPageBase props={{ selectedTab: "overview", unavailableMessage, railLabel }} />)

        const panel = container.querySelector("#dashboard-panel-overview")
        const order = Array.from(panel?.querySelectorAll("[data-testid]") ?? []).map((node) => node.getAttribute("data-testid"))
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
        const rail = container.querySelector("[data-dashboard-rail=\"true\"]")
        const railOrder = Array.from(rail?.querySelectorAll("[data-testid]") ?? []).map((node) => node.getAttribute("data-testid"))
        expect(railOrder).toEqual(["IdentityRail", "QuickActions"])
        expect(container.querySelector("[data-dashboard-overview-metrics='true']")).toHaveClass("gap-3")
        expect(container.querySelector("[data-dashboard-overview='true']")).toHaveClass("gap-6")
    })

    it("reaches the explore panel and nothing else", () => {
        render(<DashboardPageBase props={{ selectedTab: "explore", unavailableMessage, railLabel }} />)

        expect(screen.getByTestId("ExploreTab")).toBeInTheDocument()
        expect(screen.queryByTestId("WhoToFollow")).not.toBeInTheDocument()
        expect(screen.queryByTestId("ContinueLearning")).not.toBeInTheDocument()
        expect(screen.queryByText(unavailableMessage)).not.toBeInTheDocument()
    })

    it("reaches the bulletin panel as a separate dashboard destination", () => {
        render(<DashboardPageBase props={{ selectedTab: "bulletin", unavailableMessage, railLabel }} />)

        expect(screen.getByTestId("FeedExplorer")).toBeInTheDocument()
        expect(screen.queryByTestId("ExploreTab")).not.toBeInTheDocument()
        expect(screen.queryByTestId("WhoToFollow")).not.toBeInTheDocument()
        expect(screen.queryByText(unavailableMessage)).not.toBeInTheDocument()
    })

    it("reaches the courses panel and nothing else", () => {
        render(<DashboardPageBase props={{ selectedTab: "courses", unavailableMessage, railLabel }} />)

        expect(screen.getByTestId("CoursesTab")).toBeInTheDocument()
        expect(screen.queryByTestId("UpcomingLivestreamCard")).not.toBeInTheDocument()
        expect(screen.queryByTestId("ExploreTab")).not.toBeInTheDocument()
    })

    it.each(["explore", "courses"])("keeps the %s rail limited to standing and quick access", (selectedTab) => {
        const { container } = render(<DashboardPageBase props={{ selectedTab, unavailableMessage, railLabel }} />)

        const rail = container.querySelector("[data-dashboard-rail='true']")
        const railOrder = Array.from(rail?.querySelectorAll("[data-testid]") ?? []).map((node) => node.getAttribute("data-testid"))
        expect(railOrder).toEqual(["IdentityRail", "QuickActions"])
    })

    it("reaches the community panel and nothing else", () => {
        render(<DashboardPageBase props={{ selectedTab: "community", unavailableMessage, railLabel }} />)

        expect(screen.getByTestId("CommunityTab")).toBeInTheDocument()
        expect(screen.queryByTestId("CoursesTab")).not.toBeInTheDocument()
    })

    it("settles an unpublished tab as a centred notice instead of an empty main", () => {
        render(<DashboardPageBase props={{ selectedTab: "invoices", unavailableMessage, railLabel }} />)

        expect(screen.getByText(unavailableMessage)).toBeInTheDocument()
        expect(screen.queryByRole("main")).not.toBeInTheDocument()
        expect(screen.queryByTestId("ContinueLearning")).toBeNull()
        expect(screen.getByTestId("IdentityRail")).toBeInTheDocument()
    })

    it("puts the supporting rail before the selected task region", () => {
        const { container } = render(<DashboardPageBase props={{ selectedTab: "overview", unavailableMessage, railLabel }} />)

        const frame = container.querySelector("[data-dashboard-frame=\"true\"]")
        const primary = container.querySelector("#dashboard-panel-overview")
        const rail = container.querySelector("[data-dashboard-rail=\"true\"]")
        expect(frame).toBeInTheDocument()
        expect(primary).toHaveClass("mx-auto", "py-6")
        expect(primary).not.toHaveClass("lg:mx-0", "pt-6")
        // The region owns the track and the separator; the sticky offset and the bounded height are
        // Grammar's, so the page names neither.
        expect(rail).toHaveClass("lg:w-64", "lg:self-stretch", "lg:border-r")
        expect(rail?.className).not.toMatch(/calc\(/)
        expect(rail?.querySelector("[data-grammar-rail-mode='sticky']")).toBeInTheDocument()
        expect(container.querySelector("[data-dashboard-leading-rule=\"true\"]")).toBeNull()
        const railScroll = container.querySelector("[data-dashboard-rail-scroll=\"true\"]")
        expect(railScroll).toHaveClass("scroll-shadow", "scroll-shadow--vertical", "lg:h-0", "lg:flex-1")
        const railComesFirst = primary !== null && rail !== null
            && Boolean(rail.compareDocumentPosition(primary) & Node.DOCUMENT_POSITION_FOLLOWING)
        expect(railComesFirst).toBe(true)
    })

    it("keeps exactly one supporting rail before the selected task", () => {
        const { container } = render(<DashboardPageBase props={{ selectedTab: "overview", unavailableMessage, railLabel }} />)

        expect(screen.getAllByTestId("IdentityRail")).toHaveLength(1)
        expect(screen.getAllByTestId("QuickActions")).toHaveLength(1)
        const primary = container.querySelector("#dashboard-panel-overview")
        const rail = container.querySelector("[data-dashboard-rail=\"true\"]")
        expect(primary !== null && rail !== null && Boolean(rail.compareDocumentPosition(primary) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true)
    })

    it("projects the rail into one compact subnav and controlled drawer", () => {
        const setRailOpen = vi.fn()
        const compactProps = {
            selectedTab: "overview",
            unavailableMessage,
            railLabel,
            railPresentation: "drawer" as const,
            railOpenLabel: "Open stats and quick access",
            railCloseLabel: "Close stats and quick access",
            backLabel: "Back",
            isRailOpen: false,
        }
        const { container, rerender } = render(<DashboardPageBase props={compactProps} on={{ setRailOpen }} />)

        expect(container.querySelector("[data-dashboard-frame='true']")).toHaveClass("gap-0", "pb-0", "scroll-pb-6")
        expect(container.querySelector("[data-dashboard-frame='true']")).not.toHaveClass("pb-24", "scroll-pb-24")
        expect(container.querySelector("[data-dashboard-selected-panel='true']")).toHaveClass("px-3", "py-6")
        expect(container.querySelector("[data-dashboard-selected-panel='true']")).not.toHaveClass("sm:px-5", "lg:px-8")
        expect(container.querySelector("[data-grammar-subnav='true']")).toHaveAttribute("data-grammar-subnav-position", "sticky")
        // Subnav reads the band height it publishes about itself; the page sets no offset token.
        expect(container.querySelector("[data-grammar-subnav='true']")?.className).not.toMatch(/subnav-offset/)
        expect(container.querySelector("[data-dashboard-rail='true']")).toBeNull()
        expect(screen.getByRole("button", { name: "Back" })).toHaveAttribute("data-appearance", "muted")
        const openButton = screen.getByRole("button", { name: "Open stats and quick access" })
        expect(openButton).toHaveAttribute("aria-expanded", "false")
        expect(openButton).toHaveClass("starci-core-subnav-toggle")
        expect(openButton).not.toHaveClass("rounded-full", "bg-default")
        fireEvent.click(openButton)
        expect(setRailOpen).toHaveBeenCalledWith(true)

        rerender(<DashboardPageBase props={{ ...compactProps, isRailOpen: true }} on={{ setRailOpen }} />)
        expect(screen.getByRole("button", { name: "Close stats and quick access" })).toHaveAttribute("aria-expanded", "true")
        expect(screen.getByTestId("dashboard-rail-drawer")).toHaveAttribute("data-inset", "none")
        expect(screen.queryByText(railLabel)).toBeNull()
        expect(screen.getAllByTestId("IdentityRail")).toHaveLength(1)
        expect(screen.getAllByTestId("QuickActions")).toHaveLength(1)
        expect(container.querySelector("[data-dashboard-rail='true']")).toHaveClass("px-3", "py-6")
        expect(container.querySelector("[data-dashboard-rail-presentation='drawer']")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "dismiss drawer" }))
        expect(setRailOpen).toHaveBeenLastCalledWith(false)
    })
})
