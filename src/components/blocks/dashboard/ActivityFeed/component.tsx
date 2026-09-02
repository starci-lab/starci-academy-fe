import { SurfaceListCard } from "@starci/grammar/common"
import { ActivityRow, type ActivityRowData } from "@/components/composites/ActivityRow"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import type { ReactionType } from "@/modules/api/graphql/queries/types/reactions"
import { activityDayClassName, activityDayLabelClassName, activityDayRowsClassName, activityFeedClassName } from "./classNames"

/** One local calendar day and its activity rows. */
export type ActivityDayData = { readonly id: string; readonly label: string; readonly rows: ReadonlyArray<ActivityRowData> }
/** Resolved activity groups and result copy. */
export type ActivityFeedData = { readonly label?: string; readonly days: ReadonlyArray<ActivityDayData>; readonly message: string; readonly description?: string; readonly actionLabel?: string }
/** Activity row actions keyed by row identity. */
export type ActivityFeedActions = { readonly [key: string]: ((reaction?: ReactionType | null) => void) | undefined }
/** State and resolved data accepted by the activity feed. */
export type ActivityFeedProps = { readonly state: "pending" | "filteredEmpty" | "platformEmpty" | "failed" | "ready"; readonly props: ActivityFeedData; readonly on?: ActivityFeedActions; readonly isFrameless?: boolean; readonly hasTrailingContent?: boolean }
/** Draw activity groups, result notices and reaction-capable rows. */
export const ActivityFeedBase = (props: ActivityFeedProps) => {
    const label = props.props.label ?? "Activity"
    const isResult = props.state === "filteredEmpty" || props.state === "platformEmpty" || props.state === "failed"
    const days = props.state === "pending" ? Array.from({ length: 2 }, (_, index) => ({ id: `resting-day-${index}`, label: "", rows: [] })) : props.props.days
    const content = isResult
        ? <EmptyNotice message={props.props.message} description={props.props.description} actionLabel={props.props.actionLabel} iconSource={iconSourceFor("explore", "leading")} onAction={({ act: props.on?.resultAction })?.act} />
        : <div className={activityFeedClassName}>{days.map((day, dayIndex) => {
            const rows = props.state === "pending" ? Array.from({ length: 4 }, (_, index) => ({ id: `${day.id}-${index}` })) : day.rows
            return <section className={activityDayClassName} data-dashboard-activity-day="true" key={day.id}>
                <div className={activityDayLabelClassName}><Text size={"xs"} tone={"muted"} weight={"medium"} isSkeleton={props.state === "pending"}>{day.label}</Text></div>
                <div className={activityDayRowsClassName}>{rows.map((row, rowIndex) => <ActivityRow key={row.id} props={row} on={{ openActor: props.on?.[`actor:${row.id}`], openTarget: props.on?.[`target:${row.id}`], react: (type) => props.on?.[`react:${row.id}`]?.(type) }} isLoading={props.state === "pending"} isBottomEdge={props.hasTrailingContent !== true && dayIndex === days.length - 1 && rowIndex === rows.length - 1} />)}</div>
            </section>
        })}</div>
    if (props.isFrameless === true) return <section aria-label={label}>{content}</section>
    return <SurfaceListCard label={label} labelHidden={true} depth={"nested"} isLoading={props.state === "pending"}>{content}</SurfaceListCard>
}
