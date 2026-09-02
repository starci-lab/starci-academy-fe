import { SurfaceCard } from "@starci/grammar/common"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"
import type { LabelledProgressRowData } from "@/components/composites/LabelledProgressRow"
import {
    weeklyGoalsCardClassName,
    weeklyGoalsCellClassName,
    weeklyGoalsFooterClassName,
    weeklyGoalsGridClassName,
    weeklyGoalsSeparatorClassName,
    weeklyGoalsSummaryBandClassName,
} from "./classNames"

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

/** Props for {@link WeeklyGoalsBase}, discriminated by the situation. */
export type WeeklyGoalsProps = (
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
) & { readonly on?: WeeklyGoalsActions }

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

/**
 * Render the week.
 *
 * @param props - {@link WeeklyGoalsProps}
 */
export const WeeklyGoalsBase = (props: WeeklyGoalsProps) => {
    if (props.state === "failed") {
        return (
            <SurfaceCard label={props.props.label} composition={"single"}><EmptyNotice message={props.props.message} actionLabel={props.props.retryLabel} iconSource={iconSourceFor("league", "leading")} onAction={({ act: props.on?.retry })?.act} /></SurfaceCard>
        )
    }

    const isLoading = props.state === "pending"
    const rows = props.state === "ready" ? props.props.rows : RESTING_ROWS
    const edit = props.state === "ready" && props.on?.edit !== undefined
        ? <div className={weeklyGoalsFooterClassName}><Button variant="secondary" size="sm" onPress={props.on.edit}>{props.props.editLabel}</Button></div>
        : null

    return (
        <SurfaceCard label={props.props.label} height={"fill"} composition={"joined"} state={isLoading ? "pending" : "neutral"}>
            <div className={weeklyGoalsCardClassName}>
                <div className={weeklyGoalsSummaryBandClassName} data-part="weekly-goals-summary">
                    <Text size={"sm"} weight={"medium"} isSkeleton={isLoading}>{props.state === "ready" ? props.props.summary : undefined}</Text>
                </div>
                <div aria-hidden className={weeklyGoalsSeparatorClassName} />
                <div className={weeklyGoalsGridClassName} data-part="weekly-goals-grid">
                    {rows.map((row) => (
                        <div className={weeklyGoalsCellClassName} key={row.id}>
                            <LabelledProgressRow props={row} titleWeight="normal" isLoading={isLoading} />
                        </div>
                    ))}
                </div>
                {edit === null ? null : (
                    <>
                        <div aria-hidden className={weeklyGoalsSeparatorClassName} />
                        {edit}
                    </>
                )}
            </div>
        </SurfaceCard>
    )
}
