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
 * the ONE fact none of those blocks can settle - whether there is a session at all.
 *
 * WHY THAT MATTERS MORE THAN IT LOOKS. Every query behind this screen is auth-gated, so without a
 * token they do not fail slowly, they fail forever: SWR retries a rejected key on a backoff and
 * reports `isLoading` again each time, which is how a signed-out dashboard ends up shimmering at a
 * reader who is not waiting for anything. Answering it here, once, before a single request is
 * made, is what stops that.
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

/** Data required by the signed-out dashboard tree. */
export type DashboardSignedOutProps = {
    /** The already-resolved name of the screen. */
    readonly title: string
    /** The sections, in reading order. */
    readonly tabs: ReadonlyArray<DashboardTab>
    /** The panel selected by the navbar's original `?tab=` contract. */
    readonly selectedTab: string
    readonly message: string
    readonly signInLabel: string
}

/** Data required by the signed-in dashboard tree. */
export type DashboardSignedInProps = {
    /** The already-resolved name of the screen. */
    readonly title: string
    /** The sections, in reading order. */
    readonly tabs: ReadonlyArray<DashboardTab>
    /** The panel selected by the navbar's original `?tab=` contract. */
    readonly selectedTab: string
    readonly signOutLabel: string
    readonly unavailableMessage: string
}

/** Props for {@link _DashboardPage}, discriminated by the situation. */
/** What the page reports. */
export type DashboardPageActions = {
    /** Called when the reader ends the session. */
    readonly signOut?: () => void
    /** Called when a signed-out reader asks to sign in. */
    readonly signIn?: () => void
}

/** Props for {@link _DashboardPage}, discriminated by the situation. */
export type DashboardPageProps =
    | {
        readonly state: "signedOut"
        readonly props: DashboardSignedOutProps
        readonly on?: DashboardPageActions
    }
    | {
        readonly state: "signedIn"
        readonly props: DashboardSignedInProps
        readonly on?: DashboardPageActions
    }

/**
 * Render the dashboard.
 *
 * @param input - {@link DashboardPageProps}
 */
export const _DashboardPage = (input: DashboardPageProps) => {
    /**
     * The rail is drawn in BOTH states, because the shortcuts on it need no session: they are
     * destinations, not the reader's data. Hiding them behind sign-in would take away the one
     * thing a signed-out visitor can actually use, and leave the screen with nothing but a refusal.
     *
     * WHO THE READER IS COMES FIRST, WHERE THEY MIGHT GO COMES LAST. The rail is read top-down on
     * arrival, and standing is the thing a reader checks every visit; the shortcuts are the thing
     * they reach for once they have decided to move. Putting the destinations above the standing
     * makes the column answer a question nobody asked yet.
     */
    const rail = defineContractComponent("dashboard-rail", {
        section: [
            ...(input.state === "signedIn"
                ? [defineContractProjection("stacked-peer-controls", () => <IdentityRail />)]
                : []),
            defineContractProjection("label-row-over-card", () => <QuickActions />),
        ],
    })

    if (input.state === "signedOut") {
        return (
            <Tree
                contract="dashboard-rail-then-main"
                render={defineContractComponent("dashboard-rail-then-main", {
                    rail,
                    main: defineContractComponent("centred-empty-notice", {
                        notice: defineLeafComponent("empty-notice", {}, () => (
                            <EmptyNotice
                                props={{ icon: "signIn", message: input.props.message, actionLabel: input.props.signInLabel }}
                                on={{ act: input.on?.signIn }}
                            />
                        )),
                    }),
                })}
            />
        )
    }

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
