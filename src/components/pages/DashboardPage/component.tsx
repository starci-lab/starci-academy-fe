import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { ContinueLearning } from "@/components/blocks/dashboard/ContinueLearning"
import { QuickActions } from "@/components/blocks/dashboard/QuickActions"
import { IdentityRail } from "@/components/blocks/dashboard/IdentityRail"
import { DailyQuest } from "@/components/blocks/dashboard/DailyQuest"
import { StreakStrip } from "@/components/blocks/dashboard/StreakStrip"
import { WeeklyGoals } from "@/components/blocks/dashboard/WeeklyGoals"
import { JobReadinessWidget } from "@/components/blocks/dashboard/JobReadinessWidget"
import { WeeklyChallengeCard } from "@/components/blocks/dashboard/WeeklyChallengeCard"
import { OverviewContributions } from "@/components/blocks/dashboard/OverviewContributions"
import { ChangelogList } from "@/components/blocks/dashboard/ChangelogList"
import { ExploreTab } from "@/components/blocks/dashboard/ExploreTab"
import { CoursesTab } from "@/components/blocks/dashboard/CoursesTab"
import { CommunityTab } from "@/components/blocks/dashboard/CommunityTab"
import { defineCompositeComponent, defineContractComponent, defineContractProjection } from "@/components/contracts/props"

/**
 * PAGE - `DashboardPage`, presentational half.
 *
 * IT OWNS NO REQUEST. Every figure on screen belongs to a block that fetches it. What it owns is
 * its block reading order. Session access is settled by the connected half before this tree is
 * mounted, so no signed-out dashboard arrangement exists here.
 *
 * THE LEGACY OVERVIEW IS THE PRODUCT CONTRACT. Refactoring may change who fetches, who assembles,
 * and how the tree is type-checked; it may not silently remove a product section. Each overview
 * block therefore keeps the legacy reading order and owns its own settled loading, empty, failed,
 * and ready shapes.
 */

/** Data required by the dashboard tree. */
export type DashboardPageData = {
    /** The panel selected by the navbar's original `?tab=` contract. */
    readonly selectedTab: string
    readonly unavailableMessage: string
}

/** Props for {@link _DashboardPage}. */
export type DashboardPageProps = {
    readonly props: DashboardPageData
}

/**
 * Render the dashboard.
 *
 * @param input - {@link DashboardPageProps}
 */
export const _DashboardPage = (input: DashboardPageProps) => {
    /**
     * WHO THE READER IS COMES FIRST, WHERE THEY MIGHT GO COMES LAST. The rail is read top-down on
     * arrival, and standing is the thing a reader checks every visit; the shortcuts are the thing
     * they reach for once they have decided to move. Putting the destinations above the standing
     * makes the column answer a question nobody asked yet.
     */
    const rail = defineContractComponent("dashboard-rail", {
        section: [
            defineContractProjection("stacked-stat-rows", () => <IdentityRail />),
            defineContractProjection("label-row-over-card", () => <QuickActions />),
        ],
    })

    const main = input.props.selectedTab === "explore"
        ? defineContractComponent("dashboard-main", {
            section: [defineContractProjection("explore-main", () => <ExploreTab />)],
        })
        : input.props.selectedTab === "courses"
            ? defineContractProjection("dashboard-tab-main", () => <CoursesTab />)
            : input.props.selectedTab === "community"
                ? defineContractProjection("dashboard-tab-main", () => <CommunityTab />)
                : input.props.selectedTab === "overview"
                    ? defineContractComponent("dashboard-main", {
                        section: [
                            defineContractProjection("label-row-over-card", () => <ContinueLearning />),
                            defineContractProjection("label-row-over-card", () => <DailyQuest />),
                            defineContractProjection("label-row-over-card", () => <StreakStrip />),
                            defineContractProjection("label-row-over-card", () => <WeeklyGoals />),
                            defineContractProjection("label-row-over-card", () => <JobReadinessWidget />),
                            defineContractProjection("label-row-over-card", () => <WeeklyChallengeCard />),
                            defineContractProjection("label-row-over-card", () => <OverviewContributions />),
                            defineContractProjection("label-row-over-card", () => <ChangelogList />),
                        ],
                    })
                    : defineContractProjection("centred-empty-notice", () => (
                        <SurfaceCard contract="centred-empty-notice" render={defineContractComponent("centred-empty-notice", {
                            notice: defineCompositeComponent("empty-notice", {}, () => (
                                <EmptyNotice props={{ icon: input.props.selectedTab === "community" ? "community" : "explore", message: input.props.unavailableMessage }} />
                            )),
                        })} />
                    ))

    return (
        <Tree
            contract="dashboard-rail-then-main"
            render={defineContractComponent("dashboard-rail-then-main", {
                rail,
                main,
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "pure", domain: "dashboard" } as const
