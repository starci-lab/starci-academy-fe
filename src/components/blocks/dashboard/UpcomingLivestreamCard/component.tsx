import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { UpcomingLivestreamRow, type UpcomingLivestreamRowData } from "@/components/composites/UpcomingLivestreamRow"
/** Upcoming session data. */
export type UpcomingData = { readonly label: string; readonly rows: ReadonlyArray<UpcomingLivestreamRowData>; readonly errorMessage?: string; readonly retryLabel?: string }
/** Upcoming session actions. */
export type UpcomingActions = { readonly [key: string]: (() => void) | undefined }
/** Upcoming session state and data. */
export type UpcomingLivestreamCardProps = { readonly state: "pending" | "hidden" | "failed" | "ready"; readonly props: UpcomingData; readonly on?: UpcomingActions }
/** Draw upcoming livestream sessions. */
export const UpcomingLivestreamCardBase = (props: UpcomingLivestreamCardProps) => {
    if (props.state === "hidden") return null
    if (props.state === "failed") return <SurfaceCard props={{ label: props.props.label }}><EmptyNotice props={{ icon: "livestream", message: props.props.errorMessage ?? "", actionLabel: props.props.retryLabel }} on={{ act: props.on?.retry }} /></SurfaceCard>
    const rows = props.state === "pending" ? Array.from({ length: 3 }, (_, index) => ({ id: `resting-${index}` })) : props.props.rows
    return <SurfaceListCard props={{ label: props.props.label }} isLoading={props.state === "pending"}>{rows.map((row) => <UpcomingLivestreamRow key={row.id} props={row} on={{ open: props.on?.[`open:${row.id}`] }} isLoading={props.state === "pending"} />)}</SurfaceListCard>
}
