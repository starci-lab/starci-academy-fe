import { Text } from "@/components/atoms/Text"
import { Tree } from "@/components/frames/Tree"

/**
 * COMPOSITE - `KeyValue`: a named fact and the fact, on one line.
 *
 * PORTED FROM THE LIVE PRODUCT, where it is the line every specification list is made of - a
 * plan's limits, a submission's metadata, a profile's fields. It is the sibling of
 * `IconLabelValueRow` and the difference between them is not decoration: that one leads with a
 * glyph because its rows are SCANNED, this one has none because its rows are READ, in a column
 * where the values line up under each other and the eye moves down rather than across.
 *
 * WHY THE VALUE CAN BE SET FIRMLY. In a specification list the value is what the reader came
 * for and the name is the index to it, which is the opposite weighting from a stat row. `strong`
 * says that without changing the size of either half - a bigger value would make one line of a
 * column louder than its neighbours for no reason a reader could name.
 *
 * ONLY THE VALUE RESTS. The name is copy the caller already holds; shimmering it would hide a
 * word that is not waiting on anything.
 */

/** Props for {@link KeyValue}. */
export interface KeyValueProps {
    /** The already-resolved name of the fact. */
    label: string
    /** The already-resolved fact. The only part that rests. */
    value: string
    /** Sets the value firmly, for a list where the value is what the reader came for. */
    isStrong?: boolean
    /** Nothing to show for this line YET - the first load of the request behind it. */
    isLoading?: boolean
}

/**
 * Draw one named fact.
 *
 * @param props - {@link KeyValueProps}
 */
export const KeyValue = ({ label, value, isStrong = false, isLoading = false }: KeyValueProps) => {
    /** The `heading` role: the name, quiet, because it is the index rather than the answer. */
    const Label = () => (
        <Text tone="muted" size="sm">
            {label}
        </Text>
    )

    /** The `meta` role: the fact itself. */
    const Value = () => (
        <Text size="sm" weight={isStrong ? "medium" : "normal"} isLoading={isLoading}>
            {value}
        </Text>
    )

    return <Tree contract="key-value-row" slots={{ heading: Label, meta: Value }} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "composite", name: "KeyValue" } as const
