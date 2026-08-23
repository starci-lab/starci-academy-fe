import { SurfaceListCard, type SurfaceListCardActions, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Podium, type PodiumEntryData } from "@/components/composites/Podium"
import { RankedUserRow, type RankedUserRowData } from "@/components/composites/RankedUserRow"
import { StandingHeroCard, type StandingHeroProgress } from "@/components/composites/StandingHeroCard"
import { Text } from "@/components/leaves/Text"
import { defineContractComponent, defineContractProjection, defineLeafComponent, type LeafProps } from "@/components/contracts/props"
import type { LeaderboardStandingRowData } from "@/components/composites/LeaderboardStandingRow"

/** Board states owned by the connected league block. */
export type LeagueBlockState = "pending" | "empty" | "failed" | "ready"
/** Resolved board content owned by the connected league block. */
export type LeagueBlockData = {
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
    readonly emptyMessage: string
    readonly errorMessage: string
    readonly retryLabel: string
}
/** Actions emitted by the league board. */
export type LeagueBlockActions = {
    readonly climb?: () => void
    readonly retry?: () => void
    readonly open?: (id: string) => void
    readonly follow?: (id: string) => void
}
/** Pure league board input. */
export type LeagueBlockProps = { readonly state: LeagueBlockState; readonly data: LeagueBlockData; readonly on?: LeagueBlockActions }

type LeagueListData = SurfaceListCardData & { readonly rows: ReadonlyArray<RankedUserRowData>; readonly selfRow?: RankedUserRowData; readonly ellipsisLabel?: string }
const LeagueListView = ({ props, on, isLoading = false }: LeafProps<LeagueListData, SurfaceListCardActions>) => (
    <Tree contract="ranked-user-followable-list" render={defineContractProjection("ranked-user-followable-list", () => <>
        {props.rows.map((row) => <RankedUserRow key={row.id} props={row} on={{ open: on?.[`open:${row.id}`], follow: on?.[`follow:${row.id}`] }} isLoading={isLoading} />)}
        {props.ellipsisLabel === undefined ? null : <Tree contract="ranked-user-ellipsis-row" render={defineContractComponent("ranked-user-ellipsis-row", { label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.ellipsisLabel ?? "", size: "xs", tone: "muted" }} />) })} />}
        {props.selfRow === undefined ? null : <RankedUserRow props={props.selfRow} isLoading={isLoading} />}
    </>) } />
)
const LeagueListContent = defineContractComponent("ranked-user-followable-list", LeagueListView)

/** Render the board subtree; page shell and scope controls remain page-owned. */
export const LeagueBlockBase = (input: LeagueBlockProps) => {
    const board = input.data
    const loading = input.state === "pending"
    if (input.state === "empty" || input.state === "failed") {
        return <Tree contract="league-board-stack" render={defineContractProjection("league-board-stack", () => <EmptyNotice props={{ icon: "league", message: input.state === "empty" ? board.emptyMessage : board.errorMessage, actionLabel: input.state === "failed" ? board.retryLabel : board.ctaLabel }} on={{ act: input.state === "failed" ? input.on?.retry : input.on?.climb }} />)} />
    }
    const listActions = Object.fromEntries(board.rows.flatMap((row) => [[`open:${row.id}`, () => input.on?.open?.(row.id)], [`follow:${row.id}`, () => input.on?.follow?.(row.id)]])) as SurfaceListCardActions
    return <Tree contract="league-board-stack" render={defineContractComponent("league-board-stack", {
        hero: defineContractProjection("standing-hero-card", () => <StandingHeroCard props={{ standing: board.standing, progress: board.progress, ctaLabel: board.ctaLabel, progressAccessibleLabel: board.progressAccessibleLabel }} on={{ cta: input.on?.climb }} isLoading={loading} />),
        podium: defineContractProjection("podium", () => <Podium props={{ entries: board.podium, meLabel: board.meLabel, anonymousLabel: board.anonymousLabel }} isLoading={loading} />),
        list: defineContractProjection("ranked-user-followable-list", () => board.rows.length === 0 && board.selfRow === undefined ? null : <SurfaceListCard contract="ranked-user-followable-list" render={LeagueListContent} props={{ label: board.listLabel, isLabelHidden: true, isVerdict: board.rows.some((row) => row.verdict !== undefined), rows: board.rows, selfRow: board.selfRow, ellipsisLabel: board.ellipsisLabel }} on={listActions} isLoading={loading} />),
    })} />
}

/** Source-level ownership marker for the pure league board. */
export const meta = { world: "pure", domain: "community" } as const
