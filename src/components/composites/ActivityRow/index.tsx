import { Avatar } from "@/components/leaves/Avatar"
import { ReactionPicker, type ReactionLabels } from "@/components/leaves/ReactionPicker"
import { Text } from "@starci/grammar/common"
import type { ReactionType } from "@/modules/api/graphql/queries/types/reactions"
import { activityBodyClassName, activityContentClassName, activityRowClassName, activitySentenceClassName, activityTimeClassName } from "./classNames"
import { TextAction } from "@starci/grammar/common"


/** Resolved actor, event and reaction state for one activity row. */
export type ActivityRowData = { readonly id: string; readonly actor?: string; readonly avatar?: string; readonly action?: string; readonly target?: string; readonly time?: string; readonly reactionLabel?: string; readonly reactionCount?: number; readonly selectedReaction?: ReactionType | null; readonly reactionLabels?: ReactionLabels; readonly isMine?: boolean; readonly isReacting?: boolean }
/** Navigation and reaction actions reported by an activity row. */
export type ActivityRowActions = { readonly openActor?: () => void; readonly openTarget?: () => void; readonly react?: (type: ReactionType | null) => void }
/** Public inputs for the activity row composition. */
export type ActivityRowProps = { readonly props: ActivityRowData; readonly on?: ActivityRowActions; readonly isLoading?: boolean; readonly isBottomEdge?: boolean }

/** Draw one actor sentence, optional reaction and quiet timestamp. */
export const ActivityRow = (props: ActivityRowProps) => {
    const data = props.props
    const on = props.on
    const isLoading = props.isLoading ?? false
    return (
        <div className={activityRowClassName(props.isBottomEdge)} data-dashboard-activity-row="true">
            <Avatar props={{ name: data.actor, src: data.avatar, size: "sm" }} isLoading={isLoading} />
            <div className={activityBodyClassName}>
                <div className={activityContentClassName}>
                    <div className={activitySentenceClassName}>
                        <TextAction size={"sm"} appearance="inline" isSkeleton={isLoading} onPress={on?.openActor}>{data.actor ?? ""}</TextAction>
                        <Text size={"sm"} isSkeleton={isLoading}>{data.action}</Text>
                        {data.target === undefined ? null : <TextAction size={"sm"} appearance="inline" isSkeleton={isLoading} onPress={on?.openTarget}>{data.target}</TextAction>}
                    </div>
                    <div className={activityTimeClassName}><Text size={"xs"} tone={"muted"} isSkeleton={isLoading}>{data.time}</Text></div>
                </div>
                {data.reactionLabel === undefined || data.reactionLabels === undefined ? null : <ReactionPicker props={{ label: data.reactionLabel, count: data.reactionCount ?? 0, selected: data.selectedReaction, labels: data.reactionLabels, isPending: data.isReacting }} on={data.isMine === true ? undefined : { select: on?.react }} />}
            </div>
        </div>
    )
}
