import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { StreakWeekRun } from "@/components/leaves/StreakWeekRun"
import { StatRow } from "@/components/leaves/StatRow"
import { EmptyNotice } from "@/components/leaves/EmptyNotice"
import type { DayCellData } from "@/components/leaves/DayCell"

/**
 * BLOCK - `StreakStrip`, presentational half.
 *
 * The last seven days as a run of columns, beside the figure they add up to.
 *
 * THE STATE PICKS THE TREE, AND THAT IS ALL A STATE IS. `empty` and `failed` draw a notice;
 * `pending` and `ready` draw the same card, one of them resting. If a situation did not change the
 * tree it would be props, not state.
 *
 * `isLoading` IS WRITTEN HERE AND NOWHERE ABOVE. This is the seam: the block decides which tree a
 * situation deserves, and when the situation is "not settled yet" it picks the tree it would have
 * shown and hands it the flag.
 */

/** What the card carries in EVERY state - its name does not change while it loads. */
export type StreakStripFrame = {
    /** The already-resolved name of the region. */
    readonly label: string
}

/** The figure the week adds up to. */
export type StreakStripReadout = {
    /** What the figure is called. */
    readonly label: string
    /** The figure itself, already interpolated. */
    readonly value?: string
}

/**
 * Props for {@link _StreakStrip}, discriminated by the situation.
 *
 * `state="empty"` carrying a week does not compile, and `state="ready"` without one does not
 * either - which is what "the data of the state it is in" means when the compiler holds it rather
 * than a comment.
 */
export type StreakStripProps =
    | { readonly state: "pending"; readonly props: StreakStripFrame & { readonly readout: StreakStripReadout } }
    | { readonly state: "empty"; readonly props: StreakStripFrame & { readonly message: string } }
    | { readonly state: "failed"; readonly props: StreakStripFrame & { readonly message: string; readonly retryLabel: string } }
    | {
        readonly state: "ready"
        readonly props: StreakStripFrame & {
            readonly record: string
            readonly days: ReadonlyArray<DayCellData>
            readonly readout: StreakStripReadout
        }
    }

/** What the block reports. */
export type StreakStripActions = {
    /** Called when the reader asks for the week again after a failure. */
    readonly retry?: () => void
}

/**
 * Render the strip.
 *
 * @param input - {@link StreakStripProps}
 * @param on - {@link StreakStripActions}
 */
export const _StreakStrip = (input: StreakStripProps & { readonly on?: StreakStripActions }) => {
    if (input.state === "failed") {
        return (
            <SurfaceCard props={{ label: input.props.label }}>
                <EmptyNotice
                    props={{ icon: "streak", message: input.props.message, actionLabel: input.props.retryLabel }}
                    on={{ act: input.on?.retry }}
                />
            </SurfaceCard>
        )
    }
    if (input.state === "empty") {
        return (
            <SurfaceCard props={{ label: input.props.label }}>
                <EmptyNotice props={{ icon: "streak", message: input.props.message }} />
            </SurfaceCard>
        )
    }
    const isLoading = input.state === "pending"
    return (
        <SurfaceCard
            props={{ label: input.props.label, fact: input.state === "ready" ? input.props.record : undefined }}
            isLoading={isLoading}
        >
            <Tree contract="body-with-fixed-aside">
                <StreakWeekRun
                    props={{ days: input.state === "ready" ? input.props.days : undefined }}
                    isLoading={isLoading}
                />
                <StatRow
                    props={{
                        icon: "streak",
                        label: input.props.readout.label,
                        value: input.props.readout.value,
                    }}
                    isLoading={isLoading}
                />
            </Tree>
        </SurfaceCard>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "pure", domain: "streak" } as const
