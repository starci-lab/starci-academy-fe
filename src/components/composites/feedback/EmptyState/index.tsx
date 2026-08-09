import { Heading } from "@/components/atoms/Heading"
import { IconTile, type IconTileTone } from "@/components/atoms/IconTile"
import { Tree } from "@/components/frames/Tree"
import type { IconName } from "@/components/atoms/Icon"
import type { ContractSlot, ContractSlotProps } from "@/components/contracts"

/**
 * COMPOSITE - `EmptyState`: what a region says when it has nothing to show, and what it offers
 * the reader instead.
 *
 * PORTED FROM THE LIVE PRODUCT, minus everything that was a shape. The original carries a size
 * axis (`compact` / `page`), a `code` numeral, a description and a free-form body region, each
 * with its own spacing; here the arrangement is the `empty-state` key, which already declares
 * the three parts that matter and states why: an empty region still has to offer a way out, so
 * the recovery action is PART of the node rather than something a caller remembers to add.
 *
 * WHY THE ACTION IS NOT OPTIONAL. A settled nothing with no way forward is a dead end, and a dead
 * end is worse than an error message - the reader is told the region is empty and left holding
 * it. The key demands the role and this component demands the prop, so the honest question at
 * every call site is "what can they do about it", answered before the state can be drawn at all.
 *
 * WHY THE TITLE SAYS WHAT IT MEANS. `title` is the sentence a reader gets: "You have not
 * enrolled in a course yet", never "No data". The distinction is the whole value of an empty
 * state, and it is why the copy arrives resolved rather than being spelled here.
 */

/** Props for {@link EmptyState}. */
export interface EmptyStateProps {
    /** The glyph above the sentence - what KIND of thing is missing. */
    icon: IconName
    /** What the emptiness means for this region, already resolved. */
    title: string
    /** What the emptiness is: accent for a state to act on, neutral for one that is merely true. */
    tone?: IconTileTone
    /**
     * The way out. Passed UNCALLED so the resting flag reaches inside it, and REQUIRED because
     * an empty region with no way forward is a dead end.
     */
    action: ContractSlot
    /**
     * Which level of the outline this sentence is. It is a real heading: a reader jumping by
     * headings has to be able to land on the reason a region is empty.
     */
    level?: 2 | 3
    /** Renders the state in its resting shape. */
    isLoading?: boolean
}

/**
 * Draw what a region says when it has nothing to show.
 *
 * @param props - {@link EmptyStateProps}
 */
export const EmptyState = ({
    icon,
    title,
    tone = "accent",
    action,
    level = 3,
    isLoading = false,
}: EmptyStateProps) => {
    /** The `media` role of the `empty-state` key. */
    const Media = ({ isLoading: resting }: ContractSlotProps) => (
        <IconTile icon={icon} tone={tone} size="md" isLoading={resting} />
    )

    /** The `heading` role: the sentence, which says what is missing rather than that it is. */
    const Title = () => <Heading level={level}>{title}</Heading>

    return (
        <Tree
            contract="empty-state"
            isLoading={isLoading}
            slots={{ media: Media, heading: Title, action }}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "composite", name: "EmptyState" } as const
