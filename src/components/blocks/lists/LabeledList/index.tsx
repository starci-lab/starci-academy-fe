import { Heading, type HeadingLevel } from "@/components/atoms/Heading"
import { Text } from "@/components/atoms/Text"
import { Tree } from "@/components/frames/Tree"
import { KeyValue } from "@/components/composites/data/KeyValue"
import type { ContractSlot, ContractSlotProps } from "@/components/contracts"

/**
 * BLOCK - `LabeledList`: a short run of named facts under a name of their own, with a way on
 * below them - and NO surface around any of it.
 *
 * PORTED FROM THE LIVE PRODUCT, where the "no card" part was the whole point: a rail panel that
 * is a label plus three lines plus a button reads as a bounded object if it is given a border,
 * and then a rail of four of them reads as four competing cards. The original said that with a
 * comment; here it is structural, because `section` is not a surface key and cannot become one.
 *
 * WHY THE ROWS ARE DATA. The original took them as `children` and mapped whatever it was given
 * into a stack. That works right up to the first time the panel has to rest or has to say it is
 * empty, at which point the caller has to build both of those itself - which is how a design
 * system ends up with a different shimmer on every rail. Rows as data means one description of
 * the row, and the resting shape IS the row.
 *
 * THE LEADING GLYPH DID NOT SURVIVE, AND THAT IS RECORDED RATHER THAN HIDDEN. The original put
 * an icon before the label. The key that draws a glyph beside a name - `card-header` - also
 * demands a fact trailing it, and a panel label has no fact; passing an empty one to satisfy the
 * contract would be lying to the registry. The label goes bare until a key exists for a name led
 * by a glyph and nothing else.
 *
 * THE LINE ITSELF IS `KeyValue`, NOT MARKUP. A name pushed left with its fact pushed right is
 * the most repeated shape on this product, and this block is not the place to describe it for a
 * second time - the composite already does, and a column of these lines up with a column drawn
 * anywhere else because of it.
 */

/** One already-resolved line of the list. */
export interface LabeledListRow {
    /** Stable identity of the line, and its key in the run. */
    id: string
    /** The already-resolved name of the fact. */
    label: string
    /** The already-formatted fact itself. */
    value: string
}

/** Props for {@link LabeledList}. */
export interface LabeledListProps {
    /** The already-resolved name of the panel. */
    label: string
    /** A supporting fact on the name's baseline - usually how many lines there are. */
    meta?: string
    /** The lines, in reading order. */
    rows: ReadonlyArray<LabeledListRow>
    /**
     * The way on, pinned below the lines - passed UNCALLED, so it rests with the panel rather
     * than being built before there is anything to act on.
     */
    action?: ContractSlot
    /** What a reader is told when the panel settles with no lines in it. */
    emptyLabel?: string
    /**
     * Which level of the document outline this name is. Defaults to a sub-region, because a
     * rail panel sits inside a section rather than being one.
     */
    level?: HeadingLevel
    /** Nothing to show YET - the lines rest as themselves. Never a settled nothing. */
    isLoading?: boolean
}

/** How many resting lines are drawn, so the resting panel has the height of a real one. */
const RESTING_ROWS: ReadonlyArray<number> = [0, 1, 2]

/**
 * Draw a named run of facts.
 *
 * @param props - {@link LabeledListProps}
 */
export const LabeledList = ({
    label,
    meta: metaText,
    rows,
    action: Action,
    emptyLabel,
    level = 3,
    isLoading = false,
}: LabeledListProps) => {
    /** The `heading` role of the section, at whichever level of the outline the caller named. */
    const Title = () => <Heading level={level}>{label}</Heading>

    /** The `meta` role of the title line: the supporting fact, muted and small. */
    const Fact = ({ isLoading: resting }: ContractSlotProps) => (
        <Text tone="muted" size="sm" isLoading={resting}>
            {metaText ?? ""}
        </Text>
    )

    /** The `heading` role of the section: a bare name, or a name with a fact on its baseline. */
    const Header = ({ isLoading: resting }: ContractSlotProps) => {
        if (metaText === undefined) return <Title />
        return <Tree contract="section-header" isLoading={resting} slots={{ heading: Title, meta: Fact }} />
    }

    /** The lines, plus the way on that closes them - one tree, resting or loaded. */
    const Content = ({ isLoading: resting }: ContractSlotProps) => (
        <>
            {resting === true
                ? RESTING_ROWS.map((index) => (
                    <KeyValue key={index} label={label} value={label} isLoading />
                ))
                : rows.map((row) => <KeyValue key={row.id} label={row.label} value={row.value} isStrong />)}
            {resting !== true && rows.length === 0 && emptyLabel !== undefined ? (
                <Text tone="muted" size="sm">{emptyLabel}</Text>
            ) : null}
            {Action ? <Action isLoading={resting} /> : null}
        </>
    )

    /** The `body` role of the section: everything under the name, held at one seam. */
    const Body = ({ isLoading: resting }: ContractSlotProps) => (
        <Tree contract="stack" isLoading={resting} slots={{ body: Content }} />
    )

    return <Tree contract="section" isLoading={isLoading} slots={{ heading: Header, body: Body }} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "block", name: "LabeledList" } as const
