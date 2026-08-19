import { SurfaceListCard, type SurfaceListCardActions, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Podium, type PodiumEntryData } from "@/components/composites/Podium"
import { RankedUserRow, type RankedUserRowData } from "@/components/composites/RankedUserRow"
import { StandingHeroCard, type StandingHeroProgress } from "@/components/composites/StandingHeroCard"
import type { LeaderboardStandingRowData } from "@/components/composites/LeaderboardStandingRow"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { Breadcrumbs, type BreadcrumbStep } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type BlockProps,
    type LeafProps,
} from "@/components/contracts/props"

/** The two competitions this page can show. */
export type LeagueScope = "weekly" | "global"

/** One resolved board: the viewer's standing, the dais and everyone below it. */
export type LeagueBoardData = {
    readonly standing: LeaderboardStandingRowData
    readonly progress?: StandingHeroProgress
    readonly ctaLabel: string
    readonly progressAccessibleLabel: string
    readonly podium: ReadonlyArray<PodiumEntryData>
    readonly meLabel: string
    readonly anonymousLabel: string
    readonly rows: ReadonlyArray<RankedUserRowData>
    readonly selfRow?: RankedUserRowData
    readonly ellipsisLabel?: string
    readonly listLabel: string
}

/** Everything the page draws once the scope is settled. */
export type LeaguePageData = {
    readonly title: string
    /** The path that got the reader here; the last step is where they are. */
    readonly trail: ReadonlyArray<BreadcrumbStep>
    readonly scopeLabel: string
    readonly scope: LeagueScope
    readonly weeklyLabel: string
    readonly globalLabel: string
    readonly board: LeagueBoardData
    readonly emptyMessage: string
    readonly errorMessage: string
    readonly retryLabel: string
}

/** What the page reports back. */
export type LeaguePageActions = {
    readonly [key: string]: ((...args: Array<never>) => void) | undefined
    readonly selectScope?: (scope: string) => void
    readonly climb?: () => void
    readonly retry?: () => void
}

/** Situation-discriminated page props. */
export type LeaguePageProps = BlockProps<"pending" | "empty" | "failed" | "ready", LeaguePageData> & {
    readonly on?: LeaguePageActions
}

/** The joined list carries its rows as data, exactly like every other list card. */
type LeagueListData = SurfaceListCardData & {
    readonly rows: ReadonlyArray<RankedUserRowData>
    readonly selfRow?: RankedUserRowData
    readonly ellipsisLabel?: string
}

/**
 * The rows, inside the node that makes them a list.
 *
 * `SurfaceListCard` does NOT draw the contract node - it takes the key for typing and leaves the
 * drawing to whatever it renders. Returning a bare fragment here is what removed the separators and
 * the row inset from this page while the dashboard, which wraps the same rows in `Tree`, kept them:
 * every one of those classes lives on the `ranked-user-list` entry and on nothing else.
 *
 * It is a PROJECTION rather than named slots because this list holds three kinds of child - ranked
 * rows, the gap marker, and the pinned viewer row - and the `user` slot admits ranked rows only.
 */
const LeagueListView = ({ props, on, isLoading = false }: LeafProps<LeagueListData, SurfaceListCardActions>) => (
    <Tree contract="ranked-user-followable-list" render={defineContractProjection("ranked-user-followable-list", () => (
        <>
            {props.rows.map((row) => (
                <RankedUserRow
                    key={row.id}
                    props={row}
                    on={{ open: on?.[`open:${row.id}`], follow: on?.[`follow:${row.id}`] }}
                    isLoading={isLoading}
                />
            ))}
            {props.ellipsisLabel === undefined ? null : (
                <Tree contract="ranked-user-ellipsis-row" render={defineContractComponent("ranked-user-ellipsis-row", {
                    label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text props={{ content: props.ellipsisLabel, size: "xs", tone: "muted" }} />
                    )),
                })} />
            )}
            {props.selfRow === undefined ? null : (
                <RankedUserRow props={props.selfRow} isLoading={isLoading} />
            )}
        </>
    ))} />
)

const LeagueListContent = defineContractComponent("ranked-user-followable-list", LeagueListView)

/**
 * PAGE - `LeaguePage`, presentational half.
 *
 * The dashboard cards are a preview of this page; this is the whole board. The scope switch swaps
 * the WHOLE thing beneath the title, because weekly and global are two different competitions
 * rather than two filters over one.
 */
export const LeaguePageBase = (input: LeaguePageProps) => {
    const isLoading = input.state === "pending"
    const board = input.props.board
    const scope = defineContractComponent("scope-switch-row", {
        tabs: defineLeafComponent("choice-tabs", {}, () => (
            <ChoiceTabs
                props={{
                    label: input.props.scopeLabel,
                    selectedKey: input.props.scope,
                    variant: "primary",
                    tabs: [
                        { id: "weekly", label: input.props.weeklyLabel },
                        { id: "global", label: input.props.globalLabel },
                    ],
                }}
                on={{ select: input.on?.selectScope }}
            />
        )),
    })
    const header = defineContractComponent("page-header-stack", {
        trail: defineLeafComponent("breadcrumbs", {}, () => (
            <Breadcrumbs
                props={{ steps: input.props.trail, label: input.props.title }}
                on={{ home: input.on?.goHome }}
            />
        )),
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: input.props.title, level: 1 }} />
        )),
    })

    if (input.state === "empty" || input.state === "failed") {
        return (
            <Tree contract="league-page-column" render={defineContractComponent("league-page-column", {
                header,
                scope,
                board: defineContractProjection("league-board-stack", () => (
                    <EmptyNotice
                        props={{
                            icon: "league",
                            message: input.state === "empty" ? input.props.emptyMessage : input.props.errorMessage,
                            // Empty is not a failure: nobody is ranked yet, so the way out is the
                            // same climb action the hero offers rather than a retry of a request
                            // that already answered correctly.
                            actionLabel: input.state === "failed" ? input.props.retryLabel : board.ctaLabel,
                        }}
                        on={{ act: input.state === "failed" ? input.on?.retry : input.on?.climb }}
                    />
                )),
            })} />
        )
    }

    return (
        <Tree contract="league-page-column" render={defineContractComponent("league-page-column", {
            header,
            scope,
            board: defineContractComponent("league-board-stack", {
                hero: defineContractProjection("standing-hero-card", () => (
                    <StandingHeroCard
                        props={{
                            standing: board.standing,
                            progress: board.progress,
                            ctaLabel: board.ctaLabel,
                            progressAccessibleLabel: board.progressAccessibleLabel,
                        }}
                        on={{ cta: input.on?.climb }}
                        isLoading={isLoading}
                    />
                )),
                podium: defineContractProjection("podium", () => (
                    <Podium
                        props={{
                            entries: board.podium,
                            meLabel: board.meLabel,
                            anonymousLabel: board.anonymousLabel,
                        }}
                        isLoading={isLoading}
                    />
                )),
                // A cohort can be smaller than its own dais. When the podium already shows everyone
                // there is, this list draws NOTHING rather than an empty notice: the page has just
                // said who is here, and a second panel explaining that nobody else is would be the
                // screen contradicting itself one gap lower.
                list: defineContractProjection("ranked-user-followable-list", () => (board.rows.length === 0 && board.selfRow === undefined ? null : (
                    <SurfaceListCard
                        contract="ranked-user-followable-list"
                        render={LeagueListContent}
                        props={{
                            label: board.listLabel,
                            isLabelHidden: true,
                            isVerdict: board.rows.some((row) => row.verdict !== undefined),
                            rows: board.rows,
                            selfRow: board.selfRow,
                            ellipsisLabel: board.ellipsisLabel,
                        }}
                        on={input.on}
                        isLoading={isLoading}
                    />
                ))),
            }),
        })} />
    )
}

/** Source-level tier marker. */
export const meta = { world: "pure", domain: "community" } as const
