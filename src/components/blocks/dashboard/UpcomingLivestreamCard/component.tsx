import { CONTRACTS } from "@/components/contracts"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { UpcomingLivestreamRow, type UpcomingLivestreamRowData } from "@/components/composites/UpcomingLivestreamRow"
import { defineCompositeComponent, defineContractComponent, type LeafProps } from "@/components/contracts/props"
/** Resolved frame and upcoming-session rows. */
export type UpcomingData = SurfaceListCardData & { readonly rows: ReadonlyArray<UpcomingLivestreamRowData>; readonly errorMessage?: string; readonly retryLabel?: string }
/** Retry and per-session navigation actions. */
export type UpcomingActions = { readonly [key: string]: (() => void) | undefined }
/** Situation-discriminated props for upcoming sessions. */
export type UpcomingProps = { readonly state: "pending" | "hidden" | "failed" | "ready"; readonly props: UpcomingData; readonly on?: UpcomingActions }
const COUNT = CONTRACTS["upcoming-livestream-list"].children.session.restingCount
const View = ({ props, on, isLoading = false }: LeafProps<UpcomingData, UpcomingActions>) => { const rows = isLoading ? Array.from({ length: COUNT }, (_, i) => ({ id: `resting-${i}` })) : props.rows; return <Tree contract="upcoming-livestream-list" render={defineContractComponent("upcoming-livestream-list", { session: rows.map((row) => defineCompositeComponent("upcoming-livestream-row", {}, () => <UpcomingLivestreamRow props={row} on={{ open: on?.[`open:${row.id}`] }} isLoading={isLoading} />)) })} /> }
const List = defineContractComponent("upcoming-livestream-list", View)
/** Draw upcoming sessions and their local request outcomes. */
export const UpcomingLivestreamCardBase = (input: UpcomingProps) => input.state === "hidden" ? null : input.state === "failed" ? <SurfaceCard props={{ label: input.props.label }} contract="empty-notice-card" render={defineContractComponent("empty-notice-card", { notice: defineCompositeComponent("empty-notice", {}, () => <EmptyNotice props={{ icon: "livestream", message: input.props.errorMessage ?? "", actionLabel: input.props.retryLabel }} on={{ act: input.on?.retry }} />) })} /> : <SurfaceListCard contract="upcoming-livestream-list" render={List} props={input.props} on={input.on} isLoading={input.state === "pending"} />
/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "courses" } as const
