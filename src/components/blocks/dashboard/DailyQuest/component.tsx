import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { TaskProgressRow } from "@/components/leaves/TaskProgressRow"
import { EmptyNotice } from "@/components/leaves/EmptyNotice"
import type { LabelledProgressRowData } from "@/components/leaves/LabelledProgressRow"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/**
 * BLOCK - `DailyQuest`, presentational half.
 *
 * Today's tasks, and what finishing them is worth.
 *
 * THE STATE PICKS THE TREE, AND THAT IS ALL A STATE IS. `claimable` grows a control that the other
 * situations do not have, and `claimed` replaces the offer with a fact - three different trees.
 * `pending` and `open` draw the same one, with `pending` resting. If a situation did not change
 * the tree it would be props.
 *
 * THE CONTROL IS ABSENT, NOT DISABLED, until the day is done. A greyed-out claim button invites a
 * reader to press it and learn nothing; the reward line above says what it is for, and the button
 * appears when there is something to take.
 */

/** What the card carries in EVERY state - its name does not change while it loads. */
export type DailyQuestFrame = {
    /** The already-resolved name of the region. */
    readonly label: string
}

/** The tasks, already turned into words and figures. */
export type DailyQuestBody = {
    /** One row per task, in the server's own order. */
    readonly tasks: ReadonlyArray<LabelledProgressRowData>
    /** What the day is worth, as a sentence. */
    readonly rewardLine: string
}

/** Props for {@link _DailyQuest}, discriminated by the situation. */
export type DailyQuestProps =
    | { readonly state: "pending"; readonly props: DailyQuestFrame }
    | { readonly state: "empty"; readonly props: DailyQuestFrame & { readonly message: string } }
    | {
        readonly state: "failed"
        readonly props: DailyQuestFrame & { readonly message: string; readonly retryLabel: string }
    }
    | { readonly state: "open"; readonly props: DailyQuestFrame & DailyQuestBody }
    | {
        readonly state: "claimable"
        readonly props: DailyQuestFrame & DailyQuestBody & { readonly claimLabel: string }
    }
    | {
        readonly state: "claimed"
        readonly props: DailyQuestFrame & DailyQuestBody & { readonly claimedLine: string }
    }

/** What the block reports. */
export type DailyQuestActions = {
    /** Called when the reader asks for the day again after a failure. */
    readonly retry?: () => void
    /** Called when the reader collects the day's reward. */
    readonly claim?: () => void
}

/** How many rows the resting shape stands in for, so the card does not resize when they land. */
const RESTING_ROWS: ReadonlyArray<LabelledProgressRowData> = [
    { id: "resting-1" },
    { id: "resting-2" },
    { id: "resting-3" },
    { id: "resting-4" },
    { id: "resting-5" },
]

/**
 * Render the day's quest.
 *
 * @param input - {@link DailyQuestProps}
 */
export const _DailyQuest = (input: DailyQuestProps & { readonly on?: DailyQuestActions }) => {
    if (input.state === "failed") {
        return (
            <SurfaceCard props={{ label: input.props.label }} contract="empty-notice-card"
                render={defineContractComponent("empty-notice-card", { notice: defineLeafComponent("empty-notice", {}, () => <EmptyNotice
                    props={{ icon: "review", message: input.props.message, actionLabel: input.props.retryLabel }}
                    on={{ act: input.on?.retry }}
                />) })} />
        )
    }
    if (input.state === "empty") {
        return (
            <SurfaceCard props={{ label: input.props.label }} contract="empty-notice-card"
                render={defineContractComponent("empty-notice-card", {
                    notice: defineLeafComponent("empty-notice", {}, () => (
                        <EmptyNotice props={{ icon: "review", message: input.props.message }} />
                    )),
                })} />
        )
    }

    const isLoading = input.state === "pending"
    const tasks = input.state === "pending" ? RESTING_ROWS : input.props.tasks

    return (
        <SurfaceListCard
            props={{
                label: input.props.label,
                description: input.state === "open"
                    ? input.props.rewardLine
                    : input.state === "claimed" ? input.props.claimedLine : undefined,
                actionLabel: input.state === "claimable" ? input.props.claimLabel : undefined,
            }}
            on={{ act: input.on?.claim }}
            contract="daily-quest-list"
            render={defineContractComponent("daily-quest-list", {
                task: tasks.map((task) => defineLeafComponent("task-progress-row", {}, () => (
                    <TaskProgressRow
                        props={{
                            id: task.id,
                            title: task.title,
                            fact: task.percentText,
                            isComplete: task.percent === 100,
                        }}
                        isLoading={isLoading}
                    />
                ))),
            })}
            isLoading={isLoading}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "pure", domain: "quest" } as const
