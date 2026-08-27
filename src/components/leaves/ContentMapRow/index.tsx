import { Link as HeroLink } from "@heroui/react"
import { Icon } from "@/components/leaves/Icon"
import { Text } from "@/components/leaves/Text"
import { getContentMapRowClassName } from "./classNames"

/**
 * LEAF - `ContentMapRow`: one content in the course map, with its state and its length.
 *
 * Target path on materialization: `src/components/leaves/ContentMapRow/index.tsx`.
 *
 * WHY THIS IS NOT `TaskProgressRow`, which draws the same three things. A task row answers "is this
 * done"; this one answers "is this where I am". A list of tasks has no cursor, so a `isCurrent` prop
 * there would be a fact the component does not own - and the plate this draws is not a stronger tick,
 * it is a different statement. The distinguishing fact is navigation state, and neither kin carries it.
 *
 * WHY IT IS NOT `NavLink` either, which does own "where you are". A nav link is one line of words; a
 * map row is a mark, a title that wraps to two lines, and a reading time held at the far end. The
 * relationship between those three is the row, and the row is what a reader scans down.
 *
 * THE PLATE IS THE STATE, and it covers the whole row rather than the words. A tint on the title
 * alone leaves the mark and the duration reading as though they belonged to a different row - which
 * is the failure the reference render avoids by plating the line.
 */

/** What this leaf draws. */
export type ContentMapRowData = {
    /** Stable identity inside the module. */
    readonly id: string
    /** The already-resolved content title. */
    readonly title: string
    /** How long the content takes, already written the way a reader reads it. */
    readonly meta?: string
    /** Whether the reader has finished it. */
    readonly isComplete?: boolean
    /** Whether this is the content being read right now. */
    readonly isCurrent?: boolean
}

/** What choosing it does. */
export type ContentMapRowActions = {
    readonly press?: () => void
}

/** Props for {@link ContentMapRow}. */
export type ContentMapRowProps = { readonly props: ContentMapRowData; readonly on?: ContentMapRowActions; readonly isLoading?: boolean }

/**
 * Draw one content in the map.
 *
 * @param input - {@link ContentMapRowProps}
 */
export const ContentMapRow = (props: ContentMapRowProps) => (
    <HeroLink
        data-current={props.props.isCurrent === true ? "true" : "false"}
        aria-current={props.props.isCurrent === true ? "page" : undefined}
        onPress={props.on?.press}
        className={getContentMapRowClassName(props.props.isCurrent === true)}
    >
        <Icon props={{ name: props.props.isComplete === true ? "complete" : "pending", role: "leading" }} />
        <Text props={{ content: props.props.title, size: "sm" }} isLoading={props.isLoading} />
        <Text props={{ content: props.props.meta, size: "xs", tone: "muted" }} isLoading={props.isLoading} />
    </HeroLink>
)
