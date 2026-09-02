import { Heading } from "@starci/grammar/common"
import { IconLabelFactRow } from "@/components/composites/IconLabelFactRow"
import { Text } from "@starci/grammar/common"

/**
 * BLOCK - `CoursePriceDetail`: why this course costs this learner this much.
 *
 * WHY IT IS A MODAL AND NOT A TOOLTIP. The answer is not one number with a footnote - it is a
 * chain: the list price, what the current selling phase charges, what this learner's own history
 * takes off, and what that leaves. A hover surface can hold a sentence; it cannot hold a reckoning
 * the reader is expected to check line by line, and a reader deciding whether to spend money is
 * exactly the reader who will want to.
 *
 * IT REUSES THE STANDING-FIGURE ROW. Each line is a labelled amount with a mark, which is what
 * `icon-label-fact-row` already is and what `stacked-stat-rows` already stacks with no gap and no parent
 * inset. Writing a second price-row vocabulary would have made the same shape twice.
 *
 * THE FORWARD LOOK IS PROSE, NOT A ROW. Seats remaining and the next phase's price are not another
 * amount the reader is paying; they are the reason to decide now rather than later, so they read as
 * a sentence under the reckoning instead of pretending to be part of it.
 */

/** The situations the detail can be in. */
export type CoursePriceDetailState = "pending" | "ready" | "unavailable"

/** One labelled amount in the reckoning. */
export type CoursePriceLine = {
    /** Stable identity for the row. */
    readonly id: string
    /** The already-resolved label. */
    readonly label: string
    /** The already-formatted amount. */
    readonly value: string
}

/** What the detail draws once resolved. */
export type CoursePriceDetailData = {
    /** The course being priced, already resolved. */
    readonly title?: string
    /** The reckoning, top to bottom, ending with what the learner pays. */
    readonly lines?: ReadonlyArray<CoursePriceLine>
    /** Why the reduction exists, as a sentence. Absent when there is no reduction. */
    readonly reason?: string
    /** What changes if the learner waits. Absent when nothing is scheduled. */
    readonly forwardLook?: string
    /** Shown instead of the reckoning when the price cannot be personalised. */
    readonly unavailableMessage?: string
}

/** Props for {@link CoursePriceDetailBase}. */
export type CoursePriceDetailProps = {
    readonly state: CoursePriceDetailState
    readonly props: CoursePriceDetailData
}

/** The mark each line wears. The last line is what is actually owed, so it reads as settled. */
const LINE_ICONS: Readonly<Record<string, "cart" | "reward" | "complete">> = {
    list: "cart",
    phase: "cart",
    loyalty: "reward",
    payable: "complete",
}

/**
 * Draw the price story.
 *
 * @param input - {@link CoursePriceDetailProps}
 */
export const CoursePriceDetailBase = (props: CoursePriceDetailProps) => {
    const isLoading = props.state === "pending"
    const lines = props.props.lines ?? []

    return <div>
        <Heading level={2} isSkeleton={isLoading}>{props.props.title}</Heading>
        {props.state === "unavailable" ? <Text size={"sm"} tone={"muted"}>{props.props.unavailableMessage}</Text> : (
            <div>{lines.map((line) => <IconLabelFactRow key={line.id} props={{ icon: LINE_ICONS[line.id] ?? "cart", label: line.label, endText: line.value, recipe: "label-led" }} isLoading={isLoading} />)}</div>
        )}
        {props.props.reason === undefined ? null : <Text size={"sm"} tone={"muted"} isSkeleton={isLoading}>{props.props.reason}</Text>}
        {props.props.forwardLook === undefined ? null : <Text size={"sm"} tone={"muted"} isSkeleton={isLoading}>{props.props.forwardLook}</Text>}
    </div>
}
