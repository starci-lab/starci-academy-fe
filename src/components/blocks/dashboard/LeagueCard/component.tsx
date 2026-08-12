import { CONTRACTS } from "@/components/contracts"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { LeaderboardStandingRow, type LeaderboardStandingRowData } from "@/components/composites/LeaderboardStandingRow"
import { RankedUserRow, type RankedUserRowData } from "@/components/composites/RankedUserRow"
import { defineCompositeComponent, defineContractComponent } from "@/components/contracts/props"
/** Resolved weekly standing and cohort rows. */
export type LeagueCardData = { readonly label: string; readonly seeMoreLabel?: string; readonly standing: LeaderboardStandingRowData; readonly rows: ReadonlyArray<RankedUserRowData>; readonly emptyMessage?: string; readonly errorMessage?: string; readonly retryLabel?: string }
/** Retry, leaderboard and profile actions. */
export type LeagueCardActions = { readonly [key: string]: (() => void) | undefined }
/** Situation-discriminated weekly-league props. */
export type LeagueCardProps = { readonly state: "pending" | "empty" | "failed" | "ready"; readonly props: LeagueCardData; readonly on?: LeagueCardActions }
const COUNT = CONTRACTS["ranked-user-list"].children.user.restingCount
/** Draw weekly league standing and local request outcomes. */
export const _LeagueCard = (input: LeagueCardProps) => { if(input.state === "empty" || input.state === "failed") { const message = input.state === "empty" ? input.props.emptyMessage : input.props.errorMessage; return <SurfaceCard props={{ label: input.props.label }} contract="empty-notice-card" render={defineContractComponent("empty-notice-card", { notice: defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ icon: "league", message: message ?? "", actionLabel: input.state === "failed" ? input.props.retryLabel : undefined }} on={{ act: input.on?.retry }} />) })} /> } const loading = input.state === "pending"; const rows = loading ? Array.from({length:COUNT},(_,i)=>({id:`resting-${i}`})) : input.props.rows; const list = defineContractComponent("ranked-user-list", { user: rows.map((row) => defineCompositeComponent("ranked-user-row", {}, () => <RankedUserRow props={row} on={{ open: input.on?.[`open:${row.id}`] }} isLoading={loading} />)) }); return <SurfaceCard props={{ label: input.props.label, seeMoreLabel: input.props.seeMoreLabel }} on={{ seeMore: input.on?.seeMore }} contract="leaderboard-card" render={defineContractComponent("leaderboard-card", { standing: defineCompositeComponent("leaderboard-standing-row", {}, () => <LeaderboardStandingRow props={input.props.standing} isLoading={loading} />), list })} isLoading={loading} /> }
/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "community" } as const
