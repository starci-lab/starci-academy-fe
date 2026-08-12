import { CONTRACTS } from "@/components/contracts"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { ActivityRow, type ActivityRowData } from "@/components/composites/ActivityRow"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Text } from "@/components/leaves/Text"
import { defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent, type LeafProps } from "@/components/contracts/props"
import type { ReactionType } from "@/modules/api/graphql/queries/types/reactions"

/** One local-calendar group in the activity stream. */
export type ActivityDayData = { readonly id: string; readonly label: string; readonly rows: ReadonlyArray<ActivityRowData> }
/** Settled day groups and result-state copy. */
export type ActivityFeedData = {
    readonly days: ReadonlyArray<ActivityDayData>
    readonly message: string
    readonly description?: string
    readonly actionLabel?: string
}
/** Row journeys and retry reported by the activity stream. */
export type ActivityFeedActions = { readonly [key: string]: ((reaction?: ReactionType | null) => void) | undefined }
/** Props for the pure activity-feed block. */
export type ActivityFeedProps = { readonly state: "pending" | "filteredEmpty" | "platformEmpty" | "failed" | "ready"; readonly props: ActivityFeedData; readonly on?: ActivityFeedActions }
type ActivityListData = SurfaceListCardData & { readonly rows: ReadonlyArray<ActivityRowData> }

const ROW_COUNT = CONTRACTS["activity-feed-list"].children.activity.restingCount
const ActivityListView = ({ props, on, isLoading = false }: LeafProps<ActivityListData, ActivityFeedActions>) => {
    const rows = isLoading ? Array.from({ length: ROW_COUNT }, (_, index) => ({ id: `resting-${index}` })) : props.rows
    return <Tree contract="activity-feed-list" render={defineContractComponent("activity-feed-list", {
        activity: rows.map((row) => defineCompositeComponent("activity-row", {}, () => (
            <ActivityRow props={row} on={{
                openActor: on?.[`actor:${row.id}`],
                openTarget: on?.[`target:${row.id}`],
                react: (type) => on?.[`react:${row.id}`]?.(type),
            }} isLoading={isLoading} />
        ))),
    })} />
}
const ActivityList = defineContractComponent("activity-feed-list", ActivityListView)

/** Draw local-day joined activity lists or one explicit result notice. */
export const _ActivityFeed = (input: ActivityFeedProps) => {
    if (input.state === "filteredEmpty" || input.state === "platformEmpty" || input.state === "failed") {
        return <Tree contract="activity-feed-result" render={defineContractComponent("activity-feed-result", {
            notice: defineContractProjection("empty-notice-card", () => (
                <SurfaceCard props={{ label: "" }} contract="empty-notice-card" render={defineContractComponent("empty-notice-card", {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice props={{
                            message: input.props.message,
                            description: input.props.description,
                            actionLabel: input.props.actionLabel,
                        }} on={{ act: input.on?.resultAction }} />
                    )),
                })} />
            )),
        })} />
    }
    const days = input.state === "pending"
        ? Array.from({ length: 2 }, (_, index) => ({ id: `resting-day-${index}`, label: "", rows: [] }))
        : input.props.days
    return <Tree contract="activity-feed-result" render={defineContractComponent("activity-feed-result", {
        day: days.map((day) => defineContractProjection("activity-day-group", () => (
            <Tree contract="activity-day-group" render={defineContractComponent("activity-day-group", {
                subtitle: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: day.label, size: "sm", tone: "muted" }} isLoading={input.state === "pending"} />
                )),
                list: defineContractProjection("activity-feed-list", () => (
                    <SurfaceListCard
                        contract="activity-feed-list"
                        render={ActivityList}
                        props={{ label: day.label, rows: day.rows, isLabelHidden: true }}
                        on={input.on}
                        isLoading={input.state === "pending"}
                    />
                )),
            })} />
        ))),
    })} />
}
/** Source-level ownership marker for the pure social block. */
export const meta = { world: "pure", domain: "social" } as const
