import { IconTile } from "@/components/leaves/IconTile"
import { Text } from "@/components/leaves/Text"
import { Button } from "@/components/leaves/Button"
import type { IconName } from "@/components/leaves/Icon"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `EmptyNotice`: what a region says when it settled with nothing in it.
 *
 * A CLUSTER LEAF, and the same one everywhere. An empty list, an empty feed and an empty rail all
 * say the same three things in the same order - a mark, a sentence, a way out - so this is written
 * once and every block that settles empty reaches for it. A block minting its own would differ
 * from its neighbours by accident rather than by decision.
 *
 * THE WAY OUT IS PART OF IT. An empty region that only apologises leaves the reader nowhere to go,
 * so the recovery action belongs to this leaf rather than to something a caller remembers to add.
 *
 * IT NEVER RESTS. An empty state IS a settled answer - the block picks a different tree while it
 * is still loading, and picks this one only once it knows.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type EmptyNoticeData = {
    /** The mark that says which kind of thing is missing. */
    readonly icon: IconName
    /** The already-resolved sentence. What settled with nothing, in the reader's words. */
    readonly message: string
    /** The already-resolved label of the way out, when there is one. */
    readonly actionLabel?: string
}

/** What the way out does. */
export type EmptyNoticeActions = {
    /** Called when the reader takes the way out. */
    readonly act?: () => void
}

/** Props for {@link EmptyNotice}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type EmptyNoticeProps = LeafProps<EmptyNoticeData, EmptyNoticeActions>

/** Centred, because there is nothing beside it to align to. */
const NOTICE_CLASSES = "flex flex-col items-center gap-3 text-center"

/**
 * Draw an empty region's answer.
 *
 * @param input - {@link EmptyNoticeProps}
 */
export const EmptyNotice = ({ props, on }: EmptyNoticeProps) => (
    <div data-tier="leaf" data-component="EmptyNotice" className={NOTICE_CLASSES}>
        <IconTile props={{ icon: props.icon, tone: "neutral", size: "md" }} />
        <Text props={{ content: props.message, tone: "muted", size: "sm" }} />
        {props.actionLabel === undefined ? null : (
            <Button props={{ label: props.actionLabel, variant: "secondary", size: "sm", icon: "retry" }} on={{ press: on?.act }} />
        )}
    </div>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
