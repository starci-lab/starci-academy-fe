import { Heading } from "@/components/atoms/Heading"
import { Tree } from "@/components/frames/Tree"
import type { DashboardSectionChain, TreeSlots } from "@/components/classNames"

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
 *
 * WHY A ROW CARRIES TWO FLAGS AND NOT ONE STATE WORD. This file used to spell the
 * resting state as a per-row union (`"skeleton" | "empty" | "ready"`) while every other
 * component in the tree spelled it as a boolean, which is two vocabularies for one
 * fact - and the two drift the moment somebody adds a state to only one of them. The
 * row now takes the same `isLoading` the frame and the atoms take, plus `isEmpty`
 * beside it, exactly as `MyCoursesProgress` and `StreakStrip` already do.
 *
 * THE EMPTY CASE STAYS ITS OWN CONCERN. A request that finished with nothing is a
 * SETTLED ANSWER, not a wait: collapsing it into `isLoading` would leave a row
 * shimmering forever for a reader who simply has no reward balance. `isLoading` is
 * therefore read first and `isEmpty` second, so a row that is still loading can never
 * be reported as empty, and a row that settled empty can never be reported as resting.
 */

/**
 * The three shapes one row can be INSPECTED in, emitted as `data-state`.
 *
 * This is a derived readout, never a prop: the caller passes the two flags below and
 * spells none of these words, so the resting state has no second vocabulary to drift
 * into. The union that used to be a prop is what this block was renamed away from.
 */
type IdentityStatRowState = "loading" | "empty" | "ready"

/** One already-resolved stat row. */
export interface IdentityStatRow {
    /** The row label, and its key in the stack. */
    label: string
    /**
     * Nothing to show for this row YET - the first load of its own request, SWR's
     * `isLoading`. Never `isValidating`: a revalidation happens with the value already
     * on screen, and passing it here would flash a shimmer over a figure the reader is
     * reading every time the tab regains focus.
     */
    isLoading?: boolean
    /**
     * This row's request settled with nothing to show. A settled answer rather than a
     * wait, which is why it is a flag of its own and not a fourth kind of loading.
     */
    isEmpty?: boolean
    /** Already-formatted value. Read only when the row is neither loading nor empty. */
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
    rows: ReadonlyArray<IdentityStatRow>
    /** Resolved copy. */
    labels: IdentityStatsLabels
}

/**
 * Which shape one row is in. Loading is read BEFORE empty, so a row still waiting can
 * never be announced as a settled nothing.
 *
 * @param row - The row being read.
 */
const rowState = (row: IdentityStatRow): IdentityStatRowState => {
    if (row.isLoading === true) return "loading"
    if (row.isEmpty === true) return "empty"
    return "ready"
}

/**
 * The text one row shows. A row never renders two shapes: it renders its own shape
 * with whatever text its state has earned, so a resting row cannot drift from a
 * loaded one.
 *
 * @param state - The shape this row is in.
 * @param row - The row being read.
 * @param labels - Resolved copy for the placeholder states.
 */
const rowText = (state: IdentityStatRowState, row: IdentityStatRow, labels: IdentityStatsLabels): string => {
    if (state === "loading") return labels.loading
    if (state === "empty") return labels.empty
    return row.value
}

/**
 * The two slots the `stat` key declares, closed over one row.
 *
 * @param row - The row being drawn.
 * @param labels - Resolved copy for the placeholder states.
 */
const statSlots = (row: IdentityStatRow, labels: IdentityStatsLabels): TreeSlots<"stat"> => {
    const state = rowState(row)
    return {
        meta: () => <span data-part="label">{row.label}</span>,
        body: () => (
            <span data-part="value" data-state={state}>
                {rowText(state, row, labels)}
            </span>
        ),
    }
}

/**
 * Render the stat stack. See the file header for why these two keys.
 *
 * @param props - {@link IdentityStatsProps}
 */
export const _IdentityStats = ({ rows, labels }: IdentityStatsProps) => {
    /**
     * The `heading` role of the `section` key. The level is the atom's business as much
     * as the size is: `level={2}` names a section of the page, and the atom turns that
     * one word into both the tag and the type scale so the outline and the visual order
     * cannot say different things.
     */
    const SectionHeading = () => <Heading level={2}>{labels.heading}</Heading>
    /** The `body` role of the `section` key: one `stat` tree per row. */
    const Body = () => (
        <>
            {rows.map((row) => (
                <Tree key={row.label} name="stat" slots={statSlots(row, labels)} />
            ))}
        </>
    )
    return <Tree name="section" slots={{ heading: SectionHeading, body: Body }} />
}

/**
 * This block's entry in the dashboard chain: it IS the body of the region named
 * `identity-stats`.
 *
 * The `section` key above says this node takes a `heading` and a `body` and stops there - it
 * cannot say which body, which is why seven call sites of `section` currently hold seven
 * unrelated things. The entry below is the missing half, and it is a DECLARATION rather than a
 * note: swap `_IdentityStats` for another block and the pairing stops compiling, because no
 * other props type in the chain takes a `rows` list of independently resting leaves.
 */
export const identityStatsChain: DashboardSectionChain = {
    name: "identity-stats",
    body: _IdentityStats,
}
