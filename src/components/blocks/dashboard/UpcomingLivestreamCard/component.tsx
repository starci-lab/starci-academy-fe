import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { UpcomingLivestreamRow, type UpcomingLivestreamRowData } from "@/components/composites/UpcomingLivestreamRow"
/** Upcoming session data. */
export type UpcomingData = { readonly label: string; readonly rows: ReadonlyArray<UpcomingLivestreamRowData>; readonly emptyMessage?: string; readonly errorMessage?: string; readonly retryLabel?: string }
/** Upcoming session actions. */
export type UpcomingActions = { readonly [key: string]: (() => void) | undefined }
/** Upcoming session state and data. */
export type UpcomingLivestreamCardProps = { readonly state: "pending" | "empty" | "failed" | "ready"; readonly props: UpcomingData; readonly on?: UpcomingActions }
/** Draw upcoming livestream sessions. */
export const UpcomingLivestreamCardBase = (props: UpcomingLivestreamCardProps) => {
    if (props.state === "empty" || props.state === "failed") return <SurfaceListCard props={{ label: props.props.label }}><EmptyNotice props={{ icon: "livestream", message: props.state === "empty" ? props.props.emptyMessage ?? "" : props.props.errorMessage ?? "", actionLabel: props.state === "failed" ? props.props.retryLabel : undefined }} on={{ act: props.state === "failed" ? props.on?.retry : undefined }} /></SurfaceListCard>
    const rows = props.state === "pending" ? Array.from({ length: 3 }, (_, index) => ({ id: `resting-${index}` })) : props.props.rows
    return <SurfaceListCard props={{ label: props.props.label }} isLoading={props.state === "pending"}>{rows.map((row) => <UpcomingLivestreamRow key={row.id} props={row} on={{ open: props.on?.[`open:${row.id}`] }} isLoading={props.state === "pending"} />)}</SurfaceListCard>
}
