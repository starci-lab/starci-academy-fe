import { Icon } from "@/components/leaves/Icon"
import { Text } from "@/components/leaves/Text"
import type { IconName } from "@/components/leaves/Icon"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `StatRow`: one standing figure, as a glyph, its name and the number.
 *
 * A CLUSTER LEAF. Its interior is fixed - a plate, a name and a figure, in that order, everywhere
 * and forever - so it owns the seam between them. The registry describes layout that VARIES or is
 * SHARED; this is neither.
 *
 * THE GLYPH LEADS because it identifies the row faster than the name does, and the name between
 * them takes the slack, because a long one must clip rather than push the figure off the end.
 *
 * THE NAME DOES NOT REST. It is copy the caller already holds, so shimmering it would hide a word
 * that is not waiting on anything and leave the row unnamed exactly while a reader is working out
 * what it is.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type StatRowData = {
    /** The meaning drawn on the plate. */
    readonly icon: IconName
    /** What the figure is called. Copy, so it survives a loading pass. */
    readonly label: string
    /** The figure itself, already interpolated. Absent while loading. */
    readonly value?: string
}

/** Props for {@link StatRow}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type StatRowProps = LeafProps<StatRowData>

/** The glyph leads, the name takes the slack, the figure trails and never wraps. */
const ROW_CLASSES = "flex flex-row items-center gap-3 px-2 py-2 [&>*:nth-child(2)]:min-w-0 [&>*:nth-child(2)]:grow"

/**
 * Draw one standing figure.
 *
 * @param input - {@link StatRowProps}
 */
export const StatRow = ({ props, isLoading = false }: StatRowProps) => (
    <div data-tier="leaf" data-component="StatRow" className={ROW_CLASSES}>
        <Icon props={{ name: props.icon, size: "md" }} />
        <Text props={{ content: props.label, size: "sm" }} />
        <Text props={{ content: props.value, size: "sm", tone: "muted" }} isLoading={isLoading} />
    </div>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
