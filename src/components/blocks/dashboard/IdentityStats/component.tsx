import { Tree } from "@/components/frames/Tree"
import type { TreeSlots } from "@/components/classNames"

/**
 * BLOCK - `IdentityStats`, presentational half.
 *
 * Three glanceable rows about the viewer: streak, remaining weekly AI credit, reward
 * balance. Each row comes from its OWN request, so each carries its own state rather
 * than the block sharing one flag - a settled reward balance should not sit behind a
 * still-loading streak.
 *
 * Structure comes from two registry keys and nothing else. `section` holds the heading
 * and the stack; `stat` holds one row, and the reason `stat` exists is exactly the
 * reason it is right here: the label is read before the number and must never share
 * its line, or a long label on a narrow rail wraps between the number and its unit.
 */

/** Which of the three settled states one row is in. Resolved by the connected half. */
export type IdentityStatState = "skeleton" | "empty" | "ready"

/** One already-resolved stat row. */
export interface IdentityStatRow {
    /** The row label, and its key in the stack. */
    label: string
    /** The state this row's own request settled into. */
    state: IdentityStatState
    /** Already-formatted value. Read only when `state` is `ready`. */
    value: string
}

/** Every string this block renders, already resolved by the connected half. */
export interface IdentityStatsLabels {
    /** Heading over the stack. */
    heading: string
    /** Stands in for a value that has not arrived yet. */
    loading: string
    /** Stands in for a request that settled with nothing to show. */
    empty: string
}

/** Props for {@link _IdentityStats} - presentational; no fetch, no store, no i18n. */
export interface IdentityStatsProps {
    /** The rows, in display order. */
    rows: readonly IdentityStatRow[]
    /** Resolved copy. */
    labels: IdentityStatsLabels
}

/**
 * The text one row shows. A row never renders two shapes: it renders its own shape
 * with whatever text its state has earned, so a resting row cannot drift from a
 * loaded one.
 *
 * @param row - The row being read.
 * @param labels - Resolved copy for the placeholder states.
 */
const rowText = (row: IdentityStatRow, labels: IdentityStatsLabels): string => {
    if (row.state === "skeleton") return labels.loading
    if (row.state === "empty") return labels.empty
    return row.value
}

/**
 * The two slots the `stat` key declares, closed over one row.
 *
 * @param row - The row being drawn.
 * @param labels - Resolved copy for the placeholder states.
 */
const statSlots = (row: IdentityStatRow, labels: IdentityStatsLabels): TreeSlots<"stat"> => ({
    meta: () => <span data-part="label">{row.label}</span>,
    body: () => (
        <span data-part="value" data-state={row.state}>
            {rowText(row, labels)}
        </span>
    ),
})

/**
 * Render the stat stack. See the file header for why these two keys.
 *
 * @param props - {@link IdentityStatsProps}
 */
export const _IdentityStats = ({ rows, labels }: IdentityStatsProps) => {
    /** The `heading` role of the `section` key. */
    const Heading = () => <h2>{labels.heading}</h2>
    /** The `body` role of the `section` key: one `stat` tree per row. */
    const Body = () => (
        <>
            {rows.map((row) => (
                <Tree key={row.label} name="stat" slots={statSlots(row, labels)} />
            ))}
        </>
    )
    return <Tree name="section" slots={{ heading: Heading, body: Body }} />
}
