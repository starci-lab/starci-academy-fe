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

/**
 * PAGE - `DashboardPage`, presentational half.
 *
 * IT OWNS NO REQUEST. Every figure on screen belongs to a block that fetches it. What it owns is
 * its block reading order. Session access is settled by the connected half before this tree is
 * mounted, so no signed-out dashboard arrangement exists here.
 *
 * THE LEGACY OVERVIEW IS THE PRODUCT SHAPE. Refactoring may change who fetches, who assembles,
 * and how the tree is type-checked; it may not silently remove a product section. Each overview
 * block therefore keeps the legacy reading order and owns its own settled loading, empty, failed,
 * and ready shapes.
 */

/** Data required by the dashboard tree. */
export type DashboardPageData = {
    /** The panel selected by the navbar's original `?tab=` value. */
    readonly selectedTab: string
    readonly unavailableMessage: string
}

/** Props for {@link DashboardPageBase}. */
export type DashboardPageProps = {
    readonly props: DashboardPageData
}

/**
 * Render the dashboard.
 *
 * @param input - {@link DashboardPageProps}
 */
export const DashboardPageBase = (props: DashboardPageProps) => {
    /**
     * WHO THE READER IS COMES FIRST, WHERE THEY MIGHT GO COMES LAST. The rail is read top-down on
     * arrival, and standing is the thing a reader checks every visit; the shortcuts are the thing
     * they reach for once they have decided to move. Putting the destinations above the standing
     * makes the column answer a question nobody asked yet.
     */
    const main = props.props.selectedTab === "explore"
        ? <ExploreTab />
        : props.props.selectedTab === "courses"
            ? <CoursesTab />
            : props.props.selectedTab === "community"
                ? <CommunityTab />
                : props.props.selectedTab === "overview"
                    ? <><ContinueLearning /><DailyQuest /><StreakStrip /><WeeklyGoals /><JobReadinessWidget /><WeeklyChallengeCard /><OverviewContributions /><ChangelogList /></>
                    : <EmptyNotice props={{ icon: props.props.selectedTab === "community" ? "community" : "explore", message: props.props.unavailableMessage }} />

    return (
        <>
            <aside><IdentityRail /><QuickActions /></aside>
            <main>{main}</main>
        </>
    )
}
