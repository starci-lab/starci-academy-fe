import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { LabelledProgressRow } from "@/components/leaves/LabelledProgressRow"
import { EmptyNotice } from "@/components/leaves/EmptyNotice"
import { Text } from "@/components/leaves/Text"
import type { LabelledProgressRowData } from "@/components/leaves/LabelledProgressRow"

/**
 * BLOCK - `WeeklyGoals`, presentational half.
 *
 * The week's targets, how far into them the learner is, and when the week rolls over.
 *
 * `unset` IS A STATE, NOT AN EMPTY LIST, and this is the case the whole discrimination exists for.
 * The server sends every metric whether or not a target was chosen, so the rows are there either
 * way - what changes is that there is nothing to be a fraction OF. Drawing a target of zero
 * already met would tell a reader they had finished a week they never started; `unset` draws the
 * invitation instead, and it is a different tree.
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
        readonly state: "unset"
        readonly props: WeeklyGoalsFrame & WeeklyGoalsExit & { readonly prompt: string }
    }
    | {
        readonly state: "ready"
        readonly props: WeeklyGoalsFrame & WeeklyGoalsExit & {
            /** One row per metric that has a target. */
            readonly rows: ReadonlyArray<LabelledProgressRowData>
            /** The week as one sentence - percentage and the count met. */
            readonly summary: string
            /** When the week rolls over, as a sentence. Absent when the server sent no instant. */
            readonly resetLine?: string
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
const RESTING_ROWS: ReadonlyArray<LabelledProgressRowData> = [
    { id: "resting-1" },
    { id: "resting-2" },
    { id: "resting-3" },
]

/**
 * Render the week.
 *
 * @param input - {@link WeeklyGoalsProps}
 */
export const _WeeklyGoals = (input: WeeklyGoalsProps & { readonly on?: WeeklyGoalsActions }) => {
    if (input.state === "failed") {
        return (
            <SurfaceCard props={{ label: input.props.label }}>
                <EmptyNotice
                    props={{ icon: "league", message: input.props.message, actionLabel: input.props.retryLabel }}
                    on={{ act: input.on?.retry }}
                />
            </SurfaceCard>
        )
    }

    if (input.state === "unset") {
        return (
            <SurfaceCard
                props={{ label: input.props.label, seeMoreLabel: input.props.editLabel }}
                on={{ seeMore: input.on?.edit }}
            >
                <EmptyNotice props={{ icon: "league", message: input.props.prompt }} />
            </SurfaceCard>
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
                fact: input.state === "ready" ? input.props.summary : undefined,
            }}
            on={{ seeMore: input.on?.edit }}
            isLoading={isLoading}
        >
            <Tree contract="stacked-peer-controls">
                {(input.state === "ready" ? input.props.rows : RESTING_ROWS).map((row) => (
                    <LabelledProgressRow key={row.id} props={row} isLoading={isLoading} />
                ))}
            </Tree>
            {input.state === "ready" && input.props.resetLine !== undefined ? (
                <Text props={{ content: input.props.resetLine, size: "sm", tone: "muted" }} />
            ) : null}
        </SurfaceCard>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "pure", domain: "kpi" } as const
