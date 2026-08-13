import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Text } from "@/components/leaves/Text"
import type { LabelledProgressRowData } from "@/components/composites/LabelledProgressRow"
import { defineCompositeComponent, defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/**
 * BLOCK - `WeeklyGoals`, presentational half.
 *
 * The week's targets, how far into them the learner is, and when the week rolls over.
 *
 * AN UNSET CUSTOM TARGET DOES NOT ERASE THE METRIC. The connected half resolves it to the product
 * default, so this block always renders the same six comparable goals. A giant empty card would
 * discard real weekly progress merely because the learner has not customised it yet.
 *
 * THE WEEK'S OWN FIGURE SITS IN THE LABEL LINE, not among the rows. It is a fact about the set
 * rather than a member of it, and a summary that queues up with the things it summarises gets read
 * as a seventh metric.
 */

/** What the card carries in EVERY state - its name does not change while it loads. */
export type WeeklyGoalsFrame = {
    /** The already-resolved name of the region. */
    readonly label: string
}

/** The way out, offered in every settled state - a week is edited from elsewhere. */
export type WeeklyGoalsExit = {
    /** The already-resolved words of the control that leads to the editor. */
    readonly editLabel: string
}

/** Props for {@link _WeeklyGoals}, discriminated by the situation. */
export type WeeklyGoalsProps =
    | { readonly state: "pending"; readonly props: WeeklyGoalsFrame }
    | {
        readonly state: "failed"
        readonly props: WeeklyGoalsFrame & { readonly message: string; readonly retryLabel: string }
    }
    | {
        readonly state: "ready"
        readonly props: WeeklyGoalsFrame & WeeklyGoalsExit & {
            /** One row per metric that has a target. */
            readonly rows: ReadonlyArray<LabelledProgressRowData>
            /** The week as one sentence - percentage, count met and rollover. */
            readonly summary: string
        }
    }

/** What the block reports. */
export type WeeklyGoalsActions = {
    /** Called when the reader asks for the week again after a failure. */
    readonly retry?: () => void
    /** Called when the reader leaves to set or change a target. */
    readonly edit?: () => void
}

/** How many rows the resting shape stands in for, so the card does not resize when they land. */
const RESTING_ROWS: ReadonlyArray<LabelledProgressRowData> = Array.from(
    { length: 6 },
    (_unused, index) => ({ id: `resting-${index + 1}` }),
)

/** The situation this surface is in, plus the actions it exposes. */
type WeeklyGoalsInput = WeeklyGoalsProps & { readonly on?: WeeklyGoalsActions }

/**
 * Render the week.
 *
 * @param input - {@link WeeklyGoalsInput}
 */
export const _WeeklyGoals = (input: WeeklyGoalsInput) => {
    if (input.state === "failed") {
        return (
            <SurfaceCard props={{ label: input.props.label }} contract="empty-notice-card"
                render={defineContractComponent("empty-notice-card", { notice: defineCompositeComponent("empty-notice", {}, () => <EmptyNotice
                    props={{ icon: "league", message: input.props.message, actionLabel: input.props.retryLabel }}
                    on={{ act: input.on?.retry }}
                />) })} />
        )
    }

    const isLoading = input.state === "pending"

    return (
        <SurfaceCard
            props={{
                label: input.props.label,
                // While resting there is nothing to lead anywhere yet, so the way out is withheld
                // rather than drawn dead - a control that does nothing is worse than one not there.
                seeMoreLabel: input.state === "ready" ? input.props.editLabel : undefined,
            }}
            on={{ seeMore: input.on?.edit }}
            isLoading={isLoading}
            contract="weekly-goals-card"
            render={defineContractComponent("weekly-goals-card", {
                summary: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                    <Text
                        props={{
                            content: input.state === "ready" ? input.props.summary : undefined,
                            size: "sm",
                            weight: "medium",
                        }}
                        isLoading={isLoading}
                    />
                )),
                goals: defineContractComponent("bordered-goal-grid", {
                    goal: (input.state === "ready" ? input.props.rows : RESTING_ROWS).map((row) => (
                        defineCompositeComponent("labelled-progress-row", {}, () => (
                            <LabelledProgressRow props={row} isLoading={isLoading} />
                        ))
                    )),
                }),
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "pure", domain: "kpi" } as const
