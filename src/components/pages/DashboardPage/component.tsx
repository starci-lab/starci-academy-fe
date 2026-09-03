import { EmptyNotice } from "@starci/grammar/common"
import { DrawerBranch } from "@/components/branches/DrawerBranch"
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
import { FeedExplorer } from "@/components/blocks/dashboard/FeedExplorer"
import { CoursesTab } from "@/components/blocks/dashboard/CoursesTab"
import { CommunityTab } from "@/components/blocks/dashboard/CommunityTab"
import { Icon, iconSourceFor } from "@/components/leaves/Icon"
import { Rail, Subnav } from "@starci/grammar/common"
import {
    dashboardFrameClassName,
    dashboardLeadingRailRegionClassName,
    dashboardMainTrackClassName,
    dashboardOverviewClassName,
    dashboardOverviewLeadClassName,
    dashboardOverviewMetricsClassName,
    dashboardOverviewPrimaryClassName,
    dashboardOverviewQuestClassName,
    dashboardOverviewStreakClassName,
    dashboardOverviewSupportClassName,
    dashboardOverviewUpdatesClassName,
    dashboardPanelClassName,
    dashboardRailActionsClassName,
    dashboardRailContentClassName,
    dashboardRailDrawerViewportClassName,
} from "./classNames"
import { TextAction } from "@starci/grammar/common"


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
    /** Accessible name for the supporting identity and shortcut rail. */
    readonly railLabel?: string
    /** Compact projection of the rail below the desktop breakpoint. */
    readonly railPresentation?: "inline" | "drawer"
    readonly railOpenLabel?: string
    readonly railCloseLabel?: string
    readonly backLabel?: string
    readonly isRailOpen?: boolean
}

/** Controlled actions for the compact dashboard rail. */
export type DashboardPageActions = {
    readonly setRailOpen?: (isOpen: boolean) => void
    readonly goBack?: () => void
}

/** Props for {@link DashboardPageBase}. */
export type DashboardPageProps = {
    readonly props: DashboardPageData
    readonly on?: DashboardPageActions
}

/**
 * The Overview composition is intentionally not a flat list. The first two regions answer the
 * learner's immediate question, while the later bands provide evidence and recovery routes.
 */
const OverviewTab = () => (
    <div className={dashboardOverviewClassName} data-dashboard-overview="true">
        <div className={dashboardOverviewLeadClassName} data-dashboard-overview-lead="true">
            <div className={dashboardOverviewPrimaryClassName}><ContinueLearning /></div>
            <div className={dashboardOverviewQuestClassName}>
                <DailyQuest />
            </div>
        </div>
        <div className={dashboardOverviewStreakClassName} data-dashboard-overview-streak="true">
            <StreakStrip />
        </div>
        <div className={dashboardOverviewMetricsClassName} data-dashboard-overview-metrics="true">
            <WeeklyGoals />
            <JobReadinessWidget />
        </div>
        <div className={dashboardOverviewSupportClassName} data-dashboard-overview-support="true">
            <WeeklyChallengeCard />
            <OverviewContributions />
        </div>
        <div className={dashboardOverviewUpdatesClassName} data-dashboard-overview-updates="true">
            <ChangelogList />
        </div>
    </div>
)

/**
 * Render the dashboard.
 *
 * @param input - {@link DashboardPageProps}
 */
export const DashboardPageBase = (props: DashboardPageProps) => {
    const railLabel = props.props.railLabel ?? "Dashboard"
    const railPresentation = props.props.railPresentation ?? "inline"
    const isRailOpen = props.props.isRailOpen ?? false
    /**
     * WHO THE READER IS COMES FIRST, WHERE THEY MIGHT GO COMES LAST. The rail is read top-down on
     * arrival, and standing is the thing a reader checks every visit; the shortcuts are the thing
     * they reach for once they have decided to move. Putting the destinations above the standing
     * makes the column answer a question nobody asked yet.
     */
    const main = props.props.selectedTab === "explore"
        ? <ExploreTab />
        : props.props.selectedTab === "bulletin"
            ? <FeedExplorer />
            : props.props.selectedTab === "courses"
                ? <CoursesTab />
                : props.props.selectedTab === "community"
                    ? <CommunityTab />
                    : props.props.selectedTab === "overview"
                        ? <OverviewTab />
                        : <EmptyNotice message={props.props.unavailableMessage} iconSource={iconSourceFor(props.props.selectedTab === "community" ? "community" : "explore", "leading")} />

    /*
     * ONE RAIL, TWO PLACEMENTS, AND GRAMMAR OWNS BOTH.
     *
     * `Rail` is the landmark, the inset, the bounded height and the one scroll owner. Sticky pins
     * it to the band offset the navbar publishes; flow lets the drawer place it. The page keeps
     * only the reading order inside, which is the one thing it actually owns: who the reader is
     * comes first, where they might go comes after.
     */
    const rail = (presentation: "inline" | "drawer") => (
        <Rail
            inset="content"
            isLabelHidden
            label={railLabel}
            mode={presentation === "inline" ? "sticky" : "flow"}
            width={presentation === "inline" ? "compact" : "wide"}
        >
            <div className={dashboardRailContentClassName} data-dashboard-rail-presentation={presentation}>
                <IdentityRail />
                {props.props.selectedTab === "community" ? null : (
                    <div className={dashboardRailActionsClassName}><QuickActions /></div>
                )}
            </div>
        </Rail>
    )

    return (
        <>
            <div className={dashboardFrameClassName} data-dashboard-frame="true">
                {railPresentation === "drawer" ? (
                    <Subnav
                        label={railLabel}
                        title={<TextAction appearance={"muted"} startContent={<Icon source={iconSourceFor("back", "chip")} usage="chip" />} onPress={props.on?.goBack}>{props.props.backLabel ?? "Back"}</TextAction>}
                        menuIcon={<Icon source={iconSourceFor("navigationOverflow", "leading")} usage={"leading"} />}
                        openMenuLabel={props.props.railOpenLabel ?? railLabel}
                        closeMenuLabel={props.props.railCloseLabel ?? railLabel}
                        isMenuOpen={isRailOpen}
                        onMenuOpenChange={(isOpen) => props.on?.setRailOpen?.(isOpen)}
                        position="sticky"
                        visibility="always"
                    />
                ) : (
                    <div className={dashboardLeadingRailRegionClassName} data-dashboard-rail="true">
                        {rail("inline")}
                    </div>
                )}
                <div
                    className={dashboardMainTrackClassName}
                    data-dashboard-selected-panel="true"
                    id={`dashboard-panel-${props.props.selectedTab}`}
                    tabIndex={-1}
                >
                    <div className={dashboardPanelClassName}>{main}</div>
                </div>
            </div>
            {railPresentation === "drawer" ? (
                <DrawerBranch
                    inset="none"
                    isOpen={isRailOpen}
                    isTitleEmpty
                    placement="left"
                    title={railLabel}
                    onDismiss={() => props.on?.setRailOpen?.(false)}
                >
                    <div className={dashboardRailDrawerViewportClassName} data-dashboard-rail="true">
                        {rail("drawer")}
                    </div>
                </DrawerBranch>
            ) : null}
        </>
    )
}
