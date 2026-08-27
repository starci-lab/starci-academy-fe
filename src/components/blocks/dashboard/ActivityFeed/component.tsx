import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { ActivityRow, type ActivityRowData } from "@/components/composites/ActivityRow"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Text } from "@/components/leaves/Text"
import type { ReactionType } from "@/modules/api/graphql/queries/types/reactions"

/** One local calendar day and its activity rows. */
export type ActivityDayData = { readonly id: string; readonly label: string; readonly rows: ReadonlyArray<ActivityRowData> }
/** Resolved activity groups and result copy. */
export type ActivityFeedData = { readonly days: ReadonlyArray<ActivityDayData>; readonly message: string; readonly description?: string; readonly actionLabel?: string }
/** Activity row actions keyed by row identity. */
export type ActivityFeedActions = { readonly [key: string]: ((reaction?: ReactionType | null) => void) | undefined }
/** State and resolved data accepted by the activity feed. */
export type ActivityFeedProps = { readonly state: "pending" | "filteredEmpty" | "platformEmpty" | "failed" | "ready"; readonly props: ActivityFeedData; readonly on?: ActivityFeedActions }
type ActivityListData = SurfaceListCardData & { readonly rows: ReadonlyArray<ActivityRowData> }

type ActivityListProps = ActivityListData & { readonly on?: ActivityFeedActions; readonly isLoading?: boolean }
const ActivityList = (props: ActivityListProps) => {
    const rows = props.isLoading ? Array.from({ length: 4 }, (_, index) => ({ id: `resting-${index}` })) : props.rows
    return <SurfaceListCard props={{ ...props, rows }} isLoading={props.isLoading}>{rows.map((row) => <ActivityRow key={row.id} props={row} on={{ openActor: props.on?.[`actor:${row.id}`], openTarget: props.on?.[`target:${row.id}`], react: (type) => props.on?.[`react:${row.id}`]?.(type) }} isLoading={props.isLoading} />)}</SurfaceListCard>
}

/** Draw activity groups, result notices and reaction-capable rows. */
export const ActivityFeedBase = (props: ActivityFeedProps) => {
    if (props.state === "filteredEmpty" || props.state === "platformEmpty" || props.state === "failed") return <SurfaceCard props={{ label: "" }}><EmptyNotice props={{ message: props.props.message, description: props.props.description, actionLabel: props.props.actionLabel }} on={{ act: props.on?.resultAction }} /></SurfaceCard>
    const days = props.state === "pending" ? Array.from({ length: 2 }, (_, index) => ({ id: `resting-day-${index}`, label: "", rows: [] })) : props.props.days
    return <div>{days.map((day) => <section key={day.id}><Text props={{ content: day.label, size: "sm", tone: "muted" }} isLoading={props.state === "pending"} /><ActivityList label={day.label} rows={day.rows} isLabelHidden on={props.on} isLoading={props.state === "pending"} /></section>)}</div>
}
