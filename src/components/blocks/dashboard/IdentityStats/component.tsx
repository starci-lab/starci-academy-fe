import { IconLabelValueRow } from "@/components/composites/lists/IconLabelValueRow"
import type { IconName } from "@/components/atoms/Icon"
import type { DashboardSectionChain } from "@/components/contracts"

/**
 * BLOCK - `IdentityStats`, presentational half.
 *
 * Three glanceable rows about the viewer: streak, remaining weekly AI credit, reward
 * balance. Each row comes from its OWN request, so each carries its own state rather
 * than the block sharing one flag - a settled reward balance should not sit behind a
 * still-loading streak.
 *
 * THE ROW IS A COMPOSITE NOW, NOT MARKUP. `IconLabelValueRow` is the live product's most
 * repeated shape - glyph, name taking the slack, fact trailing - and this block was the second
 * place to spell it out by hand. What is left here is the only thing that is actually this
 * block's business: which three facts a viewer's standing consists of, and what each row's own
 * request has settled into.
 *
 * WHY A ROW CARRIES TWO FLAGS AND NOT ONE STATE WORD. This file used to spell the resting state
 * as a per-row union (`"skeleton" | "empty" | "ready"`) while every other component in the tree
 * spelled it as a boolean, which is two vocabularies for one fact - and the two drift the moment
 * somebody adds a state to only one of them. The row now takes the same `isLoading` the frame
 * and the atoms take, plus `isEmpty` beside it.
 *
 * THE EMPTY CASE STAYS ITS OWN CONCERN. A request that finished with nothing is a SETTLED
 * ANSWER, not a wait: collapsing it into `isLoading` would leave a row shimmering forever for a
 * reader who simply has no reward balance - and, worse, for every signed-out visitor, whose
 * auth-gated request never comes back with anything at all. `isLoading` is read first and
 * `isEmpty` second, so a row still loading can never be reported as empty.
 */

/**
 * The three shapes one row can be INSPECTED in.
 *
 * A derived readout, never a prop: the caller passes the two flags below and spells none of
 * these words, so the resting state has no second vocabulary to drift into.
 */
type IdentityStatRowState = "loading" | "empty" | "ready"

/** One already-resolved stat row. */
export interface IdentityStatRow {
    /** The row label, and its key in the stack. */
    label: string
    /**
     * What this figure MEANS, drawn beside its label. A name rather than a glyph: the icon
     * atom owns which picture says "streak", so three rows here cannot answer it differently.
     */
    icon: IconName
    /**
     * Nothing to show for this row YET - the first load of its own request, SWR's
     * `isLoading`. Never `isValidating`: a revalidation happens with the value already
     * on screen, and passing it here would flash a shimmer over a figure the reader is
     * reading every time the tab regains focus.
     */
    isLoading?: boolean
    /**
     * This row's request settled with nothing to show - including the case where it settled
     * by FAILING, which is a settled answer too. A row that treated a failure as a wait would
     * shimmer for as long as the reader looked at it.
     */
    isEmpty?: boolean
    /** Already-formatted value. Read only when the row is neither loading nor empty. */
    value: string
}

/** Every string this block renders, already resolved by the connected half. */
export interface IdentityStatsLabels {
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
 * The text one row shows. A row never renders two shapes: it renders its own shape with
 * whatever text its state has earned, so a resting row cannot drift from a loaded one.
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
 * Render the stat rows.
 *
 * @param props - {@link IdentityStatsProps}
 */
export const _IdentityStats = ({ rows, labels }: IdentityStatsProps) => (
    <>
        {rows.map((row) => (
            <IconLabelValueRow
                key={row.label}
                icon={row.icon}
                label={row.label}
                value={rowText(rowState(row), row, labels)}
                isLoading={rowState(row) === "loading"}
            />
        ))}
    </>
)

/**
 * This block's entry in the dashboard chain: it IS the body of the region named
 * `identity-stats`.
 *
 * The `card-header` key the rows are drawn with says a node takes a glyph, a name and a fact and
 * stops there - it cannot say which three rows, which is why the same key also draws a streak
 * readout. The entry below is the missing half, and it is a DECLARATION rather than a note: swap
 * `_IdentityStats` for another block and the pairing stops compiling, because no other props
 * type in the chain takes a `rows` list of independently resting leaves.
 */
export const identityStatsChain: DashboardSectionChain = {
    name: "identity-stats",
    body: _IdentityStats,
}
