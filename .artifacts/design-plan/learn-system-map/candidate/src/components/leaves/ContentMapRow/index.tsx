import { Link as HeroLink } from "@heroui/react"
import { Icon } from "@/components/leaves/Icon"
import { Text } from "@/components/leaves/Text"
import type { LeafProps } from "~candidate/components/contracts/props"

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
export type ContentMapRowProps = LeafProps<ContentMapRowData, ContentMapRowActions>

const BASE_CLASSES = "flex w-full flex-row items-start gap-3 rounded-medium px-3 py-2 text-start [&>*:first-child]:shrink-0 [&>*:nth-child(2)]:min-w-0 [&>*:nth-child(2)]:grow [&>*:last-child]:shrink-0"
const CURRENT_CLASSES = "bg-accent-soft text-accent-soft-foreground"

/**
 * Draw one content in the map.
 *
 * @param input - {@link ContentMapRowProps}
 */
export const ContentMapRow = ({ props, on, isLoading = false }: ContentMapRowProps) => (
    <HeroLink
        data-tier="leaf"
        data-component="ContentMapRow"
        data-current={props.isCurrent === true ? "true" : "false"}
        aria-current={props.isCurrent === true ? "page" : undefined}
        onPress={on?.press}
        className={`${BASE_CLASSES} ${props.isCurrent === true ? CURRENT_CLASSES : ""}`}
    >
        <Icon props={{ name: props.isComplete === true ? "complete" : "pending", role: "leading" }} />
        <Text props={{ content: props.title, size: "sm" }} isLoading={isLoading} />
        <Text props={{ content: props.meta, size: "xs", tone: "muted" }} isLoading={isLoading} />
    </HeroLink>
)

/** Source-level tier marker. */
export const meta = { shape: "leaf", world: "pure" } as const
