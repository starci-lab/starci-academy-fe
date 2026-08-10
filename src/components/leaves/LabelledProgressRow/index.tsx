import { Text } from "@/components/leaves/Text"
import { Progress } from "@/components/leaves/Progress"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `LabelledProgressRow`: a name, how far along it is, and the bar that shows it.
 *
 * A CLUSTER LEAF. Its interior is fixed - a title line with the figure at the far end, and the bar
 * underneath - everywhere and forever, so it owns the seam between them.
 *
 * IT NAMES ITS SHAPE, NOT A DOMAIN, and that is the whole reason it is reusable. It was
 * `CourseProgressRow`, which was a lie the moment a weekly target needed the same three parts: a
 * leaf named for one caller either gets copied for the second or turns its own name into a
 * falsehood. What it fixes is the ARRANGEMENT - label, figure, bar - and every caller with those
 * three things belongs here.
 *
 * THE FIGURE SITS ON THE TITLE'S LINE, not under the bar. A reader scanning a column of these is
 * comparing figures, and a figure below its own bar is read after the bar rather than with it.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type LabelledProgressRowData = {
    /** Identity of the row. Used as the key by whoever maps the list. */
    readonly id: string
    /** The already-resolved name of whatever is progressing. Absent while loading. */
    readonly title?: string
    /** Completion, 0 to 100, already clamped by whoever resolved it. Absent while loading. */
    readonly percent?: number
    /** The figure as words - "62%", "3/5" - already interpolated. Absent while loading. */
    readonly percentText?: string
}

/** Props for {@link LabelledProgressRow}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type LabelledProgressRowProps = LeafProps<LabelledProgressRowData>

/** The title and its figure at opposite ends of one line, with the bar beneath. */
const ROW_CLASSES = "flex flex-col gap-2"

/** The figure trails the name and never wraps under it. */
const LINE_CLASSES = "flex flex-row flex-wrap items-baseline justify-between gap-3"

/**
 * Draw one named thing's progress.
 *
 * @param input - {@link LabelledProgressRowProps}
 */
export const LabelledProgressRow = ({ props, isLoading = false }: LabelledProgressRowProps) => (
    <div data-tier="leaf" data-component="LabelledProgressRow" className={ROW_CLASSES}>
        <div className={LINE_CLASSES}>
            <Text props={{ content: props.title, size: "sm", weight: "medium" }} isLoading={isLoading} />
            <Text props={{ content: props.percentText, size: "sm", tone: "muted" }} isLoading={isLoading} />
        </div>
        <Progress props={{ value: props.percent, label: props.title ?? "" }} isLoading={isLoading} />
    </div>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
