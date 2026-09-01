import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { LeaderboardStandingRow, type LeaderboardStandingRowData } from "@/components/composites/LeaderboardStandingRow"
import { RankedUserRow, type RankedUserRowData } from "@/components/composites/RankedUserRow"
import { leagueEmptyNoticeClassName, leagueRankedRowClassName, leagueStandingClassName } from "./classNames"
/** Resolved weekly standing and cohort rows. */
export type LeagueCardData = { readonly label: string; readonly seeMoreLabel?: string; readonly standing: LeaderboardStandingRowData; readonly rows: ReadonlyArray<RankedUserRowData>; readonly emptyMessage?: string; readonly errorMessage?: string; readonly retryLabel?: string }
/** League interactions. */
export type LeagueCardActions = { readonly [key: string]: (() => void) | undefined }
/** Weekly leaderboard surface props. */
export type LeagueCardProps = { readonly state: "pending" | "empty" | "failed" | "ready"; readonly props: LeagueCardData; readonly on?: LeagueCardActions }
/** Draw weekly league standing and ranked users. */
export const LeagueCardBase = (props: LeagueCardProps) => {
    const loading = props.state === "pending"
    const settledEmpty = props.state === "empty" || props.state === "failed"
    const rows = loading || settledEmpty ? [] : props.props.rows
    return <SurfaceListCard props={{ label: props.props.label, isVerdict: rows.some((row) => row.verdict !== undefined) }} isLoading={loading}>
        <div className={leagueStandingClassName}><LeaderboardStandingRow props={props.props.standing} isLoading={loading} /></div>
        {settledEmpty ? <div className={leagueEmptyNoticeClassName}><EmptyNotice props={{ icon: "league", message: props.state === "empty" ? props.props.emptyMessage ?? "" : props.props.errorMessage ?? "", actionLabel: props.state === "failed" ? props.props.retryLabel : undefined }} on={{ act: props.state === "failed" ? props.on?.retry : undefined }} /></div> : rows.map((row) => <div className={leagueRankedRowClassName} data-dashboard-community-ranked-row="true" data-dashboard-community-viewer-row={row.isMe === true} key={row.id}><RankedUserRow props={row} on={{ open: props.on?.[`open:${row.id}`] }} isLoading={loading} /></div>)}
    </SurfaceListCard>
}
