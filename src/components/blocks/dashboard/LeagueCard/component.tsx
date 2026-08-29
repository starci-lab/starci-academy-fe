import { DashboardSurfaceCard as SurfaceCard } from "@/components/blocks/dashboard/DashboardSurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { LeaderboardStandingRow, type LeaderboardStandingRowData } from "@/components/composites/LeaderboardStandingRow"
import { RankedUserRow, type RankedUserRowData } from "@/components/composites/RankedUserRow"
/** Resolved weekly standing and cohort rows. */
export type LeagueCardData = { readonly label: string; readonly seeMoreLabel?: string; readonly standing: LeaderboardStandingRowData; readonly rows: ReadonlyArray<RankedUserRowData>; readonly emptyMessage?: string; readonly errorMessage?: string; readonly retryLabel?: string }
/** League interactions. */
export type LeagueCardActions = { readonly [key: string]: (() => void) | undefined }
/** Traditional league card props. */
export type LeagueCardProps = { readonly state: "pending" | "empty" | "failed" | "ready"; readonly props: LeagueCardData; readonly on?: LeagueCardActions }
/** Draw weekly league standing and ranked users. */
export const LeagueCardBase = (props: LeagueCardProps) => { if (props.state === "empty" || props.state === "failed") return <SurfaceCard props={{ label: props.props.label }}><EmptyNotice props={{ icon: "league", message: props.state === "empty" ? props.props.emptyMessage ?? "" : props.props.errorMessage ?? "", actionLabel: props.state === "failed" ? props.props.retryLabel : undefined }} on={{ act: props.on?.retry }} /></SurfaceCard>; const loading = props.state === "pending"; const rows = loading ? [] : props.props.rows; return <SurfaceCard props={{ label: props.props.label, seeMoreLabel: props.props.seeMoreLabel }} on={{ seeMore: props.on?.seeMore }} isLoading={loading}><LeaderboardStandingRow props={props.props.standing} isLoading={loading} /><SurfaceListCard props={{ label: props.props.label, isNested: true, isLabelHidden: true, isVerdict: rows.some((row) => row.verdict !== undefined) }} isLoading={loading}>{rows.map((row) => <RankedUserRow key={row.id} props={row} on={{ open: props.on?.[`open:${row.id}`] }} isLoading={loading} />)}</SurfaceListCard></SurfaceCard> }
