import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/leaves/EmptyNotice"
import { ContinueLearning } from "@/components/blocks/dashboard/ContinueLearning"
import { QuickActions } from "@/components/blocks/dashboard/QuickActions"
import { IdentityRail } from "@/components/blocks/dashboard/IdentityRail"
import { DailyQuest } from "@/components/blocks/dashboard/DailyQuest"
import { StreakStrip } from "@/components/blocks/dashboard/StreakStrip"
import { WeeklyGoals } from "@/components/blocks/dashboard/WeeklyGoals"
import { MyCoursesProgress } from "@/components/blocks/dashboard/MyCoursesProgress"
import type { IconName } from "@/components/leaves/Icon"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"

/**
 * PAGE - `DashboardPage`, presentational half.
 *
 * IT OWNS NO REQUEST. Every figure on screen belongs to a block that fetches it. What it owns is
 * its block reading order. Session access is settled by the connected half before this tree is
 * mounted, so no signed-out dashboard arrangement exists here.
 *
 * WHAT IS DELIBERATELY NOT BUILT. The live product carries daily quests, weekly goals, streak
 * freezes, contributions, job readiness, leagues and a changelog. This repo has six queries and
 * none of them backs those, so they are reported here rather than mocked - an invented number is
 * worse than an honest gap.
 */

/** One section of the dashboard. */
export type DashboardTab = {
    /** Identity of the tab, used as the key. */
    readonly id: string
    /** The already-resolved words. */
    readonly label: string
    /** The meaning drawn before the words. */
    readonly icon: IconName
    /** Whether this is the section being shown. */
    readonly isCurrent: boolean
    /** Where it goes. */
    readonly href: string
}

/** Data required by the dashboard tree. */
export type DashboardPageData = {
    /** The sections, in reading order. */
    readonly tabs: ReadonlyArray<DashboardTab>
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
            defineContractProjection("stacked-peer-controls", () => <IdentityRail />),
            defineContractProjection("label-row-over-card", () => <QuickActions />),
        ],
    })

    const main = input.props.selectedTab === "courses"
        ? defineContractComponent("dashboard-main", {
            section: [defineContractProjection("label-row-over-card", () => <MyCoursesProgress />)],
        })
        : input.props.selectedTab === "overview"
            ? defineContractComponent("dashboard-main", {
                section: [
                    defineContractProjection("label-row-over-card", () => <ContinueLearning />),
                    defineContractProjection("label-row-over-card", () => <DailyQuest />),
                    defineContractProjection("label-row-over-card", () => <StreakStrip />),
                    defineContractProjection("label-row-over-card", () => <WeeklyGoals />),
                ],
            })
            : defineContractComponent("centred-empty-notice", {
                notice: defineLeafComponent("empty-notice", {}, () => (
                    <EmptyNotice props={{ icon: input.props.selectedTab === "community" ? "community" : "explore", message: input.props.unavailableMessage }} />
                )),
            })

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
