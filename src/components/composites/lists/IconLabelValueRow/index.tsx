import { Icon, type IconName } from "@/components/atoms/Icon"
import { Text } from "@/components/atoms/Text"
import { Tree } from "@/components/frames/Tree"
import type { ContractSlot } from "@/components/contracts"

/**
 * COMPOSITE - `IconLabelValueRow`: a glyph, the name of a fact, and the fact - on one line.
 *
 * PORTED FROM THE LIVE PRODUCT, where it is the shape of every "spec line" in the identity rail:
 * a leading icon, a label that takes the slack and clips when it is long, and a value pinned to
 * the end of the row. It is the single most repeated row in the product, which is exactly why it
 * is a component rather than four lines copied into each block that wants one.
 *
 * WHAT CROSSED AND WHAT DID NOT. The original assembles the row out of two nested stacks and a
 * `flex-1` wrapper; none of that survives, because the arrangement is the `card-header` key -
 * which already says why the middle child takes the slack: a long name has to clip rather than
 * push the figure off the end of the row. What is left here is the mapping: which atom draws
 * each part, which weight the name takes against the fact beside it, and how the resting flag
 * reaches the value without blanking the label.
 *
 * ONLY THE VALUE RESTS. The label is copy the caller already holds, so shimmering it would hide
 * a word that is not waiting on anything - and would leave a row of three identical shimmer bars
 * where a reader could otherwise already see WHICH figure is still coming.
 */

/** Props for {@link IconLabelValueRow}. */
export interface IconLabelValueRowProps {
    /** What this row is about - the meaning, never a glyph the caller picked. */
    icon: IconName
    /** The already-resolved name of the fact. */
    label: string
    /**
     * The already-resolved fact. Ignored while resting, and it is the ONLY part that rests:
     * everything else on the line is known before the request settles.
     */
    value: string
    /**
     * A value that carries a state rather than a number - a streak, a plan, a verdict - drawn by
     * the caller so the tone stays a decision the surface makes. Passed UNCALLED; when it is
     * given, {@link IconLabelValueRowProps.value} is not drawn.
     */
    valueSlot?: ContractSlot
    /** Nothing to show for this row YET - the first load of its own request. */
    isLoading?: boolean
}

/**
 * Draw one spec line.
 *
 * @param props - {@link IconLabelValueRowProps}
 */
export const IconLabelValueRow = ({
    icon,
    label,
    value,
    valueSlot,
    isLoading = false,
}: IconLabelValueRowProps) => {
    /** The `media` role: the glyph, which inherits the row's ink rather than carrying its own. */
    const Media = () => <Icon name={icon} size="md" />

    /** The `heading` role: the name of the fact, set firmly enough to be read first. */
    const Label = () => (
        <Text size="sm" weight="medium">
            {label}
        </Text>
    )

    /** The `meta` role: the fact itself, or whatever the caller draws in its place. */
    const Value = valueSlot ?? (() => (
        <Text tone="muted" size="sm" isLoading={isLoading}>
            {value}
        </Text>
    ))

    return <Tree contract="card-header" slots={{ media: Media, heading: Label, meta: Value }} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "composite", name: "IconLabelValueRow" } as const
