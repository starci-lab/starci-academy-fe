import { SurfaceListCard } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { Podium, type PodiumEntryData } from "@/components/composites/Podium"
import { RankedUserRow, type RankedUserRowData } from "@/components/composites/RankedUserRow"
import { StandingHeroCard, type StandingHeroProgress } from "@/components/composites/StandingHeroCard"
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


/** Render the board subtree; page shell and scope controls remain page-owned. */
export const LeagueBlockBase = (props: LeagueBlockProps) => {
    const board = props.data
    const loading = props.state === "pending"
    if (props.state === "empty" || props.state === "failed") {
        return <EmptyNotice message={props.state === "empty" ? board.emptyMessage : board.errorMessage} actionLabel={props.state === "failed" ? board.retryLabel : board.ctaLabel} iconSource={iconSourceFor("league", "leading")} onAction={({ act: props.state === "failed" ? props.on?.retry : props.on?.climb })?.act} />
    }
    return <>
        <StandingHeroCard props={{ standing: board.standing, progress: board.progress, ctaLabel: board.ctaLabel, progressAccessibleLabel: board.progressAccessibleLabel }} on={{ cta: props.on?.climb }} isLoading={loading} />
        <Podium props={{ entries: board.podium, meLabel: board.meLabel, anonymousLabel: board.anonymousLabel }} isLoading={loading} />
        {board.rows.length === 0 && board.selfRow === undefined ? null : <SurfaceListCard label={board.listLabel} labelHidden={true} isLoading={loading}>
            {board.rows.map((row) => <RankedUserRow key={row.id} props={row} on={{ open: () => props.on?.open?.(row.id), follow: () => props.on?.follow?.(row.id) }} isLoading={loading} />)}
            {board.ellipsisLabel === undefined ? null : <span>{board.ellipsisLabel}</span>}
            {board.selfRow === undefined ? null : <RankedUserRow props={board.selfRow} isLoading={loading} />}
        </SurfaceListCard>}
    </>
}
