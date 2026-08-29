import { DashboardSurfaceCard as SurfaceCard } from "@/components/blocks/dashboard/DashboardSurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { LeaderboardStandingRow, type LeaderboardStandingRowData } from "@/components/composites/LeaderboardStandingRow"
import { RankedUserRow, type RankedUserRowData } from "@/components/composites/RankedUserRow"
/** Leaderboard data. */
export type TopLearnersData = { readonly label: string; readonly seeMoreLabel?: string; readonly standing: LeaderboardStandingRowData; readonly rows: ReadonlyArray<RankedUserRowData>; readonly emptyMessage?: string; readonly errorMessage?: string; readonly retryLabel?: string }
/** Leaderboard actions. */
export type TopLearnersActions = { readonly [key: string]: (() => void) | undefined }
/** Leaderboard state and data. */
export type TopLearnersProps = { readonly state: "pending" | "empty" | "failed" | "ready"; readonly props: TopLearnersData; readonly on?: TopLearnersActions }
/** Draw the global leaderboard and standing. */
export const TopLearnersBase = (props: TopLearnersProps) => {
    if (props.state === "empty" || props.state === "failed") return <SurfaceCard props={{ label: props.props.label }}><EmptyNotice props={{ icon: "league", message: props.state === "empty" ? props.props.emptyMessage ?? "" : props.props.errorMessage ?? "", actionLabel: props.state === "failed" ? props.props.retryLabel : undefined }} on={{ act: props.on?.retry }} /></SurfaceCard>
    const loading = props.state === "pending"
    const rows = loading ? Array.from({ length: 5 }, (_, index) => ({ id: `resting-${index}` })) : props.props.rows
    return <SurfaceCard props={{ label: props.props.label, seeMoreLabel: props.props.seeMoreLabel }} on={{ seeMore: props.on?.seeMore }} isLoading={loading}><LeaderboardStandingRow props={props.props.standing} isLoading={loading} /><SurfaceListCard props={{ label: props.props.label, isLabelHidden: true, isNested: true }}>{rows.map((row) => <RankedUserRow key={row.id} props={row} on={{ open: props.on?.[`open:${row.id}`], follow: props.on?.[`follow:${row.id}`] }} isLoading={loading} />)}</SurfaceListCard></SurfaceCard>
}
