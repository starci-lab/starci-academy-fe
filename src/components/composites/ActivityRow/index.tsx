import { Avatar } from "@/components/leaves/Avatar"
import { ReactionPicker, type ReactionLabels } from "@/components/leaves/ReactionPicker"
import { Text } from "@/components/leaves/Text"
import { TextLink } from "@/components/leaves/TextLink"
import type { ReactionType } from "@/modules/api/graphql/queries/types/reactions"

/** Resolved actor, event and reaction state for one activity row. */
export type ActivityRowData = { readonly id: string; readonly actor?: string; readonly avatar?: string; readonly action?: string; readonly target?: string; readonly time?: string; readonly reactionLabel?: string; readonly reactionCount?: number; readonly selectedReaction?: ReactionType | null; readonly reactionLabels?: ReactionLabels; readonly isMine?: boolean; readonly isReacting?: boolean }
/** Navigation and reaction actions reported by an activity row. */
export type ActivityRowActions = { readonly openActor?: () => void; readonly openTarget?: () => void; readonly react?: (type: ReactionType | null) => void }
/** Public inputs for the activity row composition. */
export type ActivityRowProps = { readonly props: ActivityRowData; readonly on?: ActivityRowActions; readonly isLoading?: boolean }

/** Draw one actor sentence, optional reaction and quiet timestamp. */
export const ActivityRow = (props: ActivityRowProps) => {
    const data = props.props
    const on = props.on
    const isLoading = props.isLoading ?? false
    return (
        <div>
            <Avatar props={{ name: data.actor, src: data.avatar, size: "sm" }} isLoading={isLoading} />
            <div>
                <div>
                    <TextLink props={{ label: data.actor ?? "", size: "sm" }} on={{ press: on?.openActor }} />
                    <Text props={{ content: data.action, size: "sm" }} isLoading={isLoading} />
                    {data.target === undefined ? null : <TextLink props={{ label: data.target, size: "sm" }} on={{ press: on?.openTarget }} />}
                </div>
                {data.reactionLabel === undefined || data.reactionLabels === undefined ? null : <ReactionPicker props={{ label: data.reactionLabel, count: data.reactionCount ?? 0, selected: data.selectedReaction, labels: data.reactionLabels, isPending: data.isReacting }} on={data.isMine === true ? undefined : { select: on?.react }} />}
            </div>
            <Text props={{ content: data.time, size: "xs", tone: "muted" }} isLoading={isLoading} />
        </div>
    )
}
