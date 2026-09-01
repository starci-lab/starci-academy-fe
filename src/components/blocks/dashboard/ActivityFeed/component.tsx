import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { ActivityRow, type ActivityRowData } from "@/components/composites/ActivityRow"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Text } from "@/components/leaves/Text"
import type { ReactionType } from "@/modules/api/graphql/queries/types/reactions"
import { activityDayClassName, activityDayLabelClassName, activityDayRowsClassName, activityFeedClassName } from "./classNames"

/** One local calendar day and its activity rows. */
export type ActivityDayData = { readonly id: string; readonly label: string; readonly rows: ReadonlyArray<ActivityRowData> }
/** Resolved activity groups and result copy. */
export type ActivityFeedData = { readonly label?: string; readonly days: ReadonlyArray<ActivityDayData>; readonly message: string; readonly description?: string; readonly actionLabel?: string }
/** Activity row actions keyed by row identity. */
export type ActivityFeedActions = { readonly [key: string]: ((reaction?: ReactionType | null) => void) | undefined }
/** State and resolved data accepted by the activity feed. */
export type ActivityFeedProps = { readonly state: "pending" | "filteredEmpty" | "platformEmpty" | "failed" | "ready"; readonly props: ActivityFeedData; readonly on?: ActivityFeedActions; readonly isFrameless?: boolean }
/** Draw activity groups, result notices and reaction-capable rows. */
export const ActivityFeedBase = (props: ActivityFeedProps) => {
    const label = props.props.label ?? "Activity"
    const isResult = props.state === "filteredEmpty" || props.state === "platformEmpty" || props.state === "failed"
    const days = props.state === "pending" ? Array.from({ length: 2 }, (_, index) => ({ id: `resting-day-${index}`, label: "", rows: [] })) : props.props.days
    const content = isResult
        ? <EmptyNotice props={{ icon: "explore", message: props.props.message, description: props.props.description, actionLabel: props.props.actionLabel }} on={{ act: props.on?.resultAction }} />
        : <div className={activityFeedClassName}>{days.map((day) => {
            const rows = props.state === "pending" ? Array.from({ length: 4 }, (_, index) => ({ id: `${day.id}-${index}` })) : day.rows
            return <section className={activityDayClassName} key={day.id}>
                <div className={activityDayLabelClassName}><Text props={{ content: day.label, size: "sm", tone: "muted", weight: "semibold" }} isLoading={props.state === "pending"} /></div>
                <div className={activityDayRowsClassName}>{rows.map((row) => <ActivityRow key={row.id} props={row} on={{ openActor: props.on?.[`actor:${row.id}`], openTarget: props.on?.[`target:${row.id}`], react: (type) => props.on?.[`react:${row.id}`]?.(type) }} isLoading={props.state === "pending"} />)}</div>
            </section>
        })}</div>
    if (props.isFrameless === true) return <section aria-label={label}>{content}</section>
    return <SurfaceListCard props={{ label, isLabelHidden: true, isNested: true }} isLoading={props.state === "pending"}>{content}</SurfaceListCard>
}
