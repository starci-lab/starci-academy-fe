import { Button } from "@/components/atoms/Button"

/**
 * BLOCK - `FollowButton`: start or stop following another learner.
 *
 * PORTED FROM THE LIVE PRODUCT, including the reasoning that is easy to mistake for styling
 * and is not. `isQuiet` exists because a leaderboard is a dense surface carrying MANY of these
 * beside a single primary action: one primary per screen is the rule, and twenty follow buttons
 * shouting at once is how a page ends up with none. A lone follow - on a profile, say - is the
 * primary, and keeps it.
 *
 * PRESENTATIONAL, AND DELIBERATELY SO. It renders the follow state and reports the press. The
 * authoritative value, the mutation and the in-flight flag all belong to whoever owns the data,
 * because a component that toggled its own state would disagree with the server the first time
 * a request failed.
 *
 * WHAT IT LOST IN THE CROSSING. The original led with a person glyph, and the icon vocabulary
 * this tree draws from has no name for one - the closed union is the point, so the block does
 * without rather than reaching past it. Recorded rather than worked around.
 */

/** Props for {@link FollowButton}. */
export interface FollowButtonProps {
    /** The authoritative follow state, owned by whoever holds the data. */
    isFollowing: boolean
    /** Reports the press. The owner runs the mutation. */
    onToggle?: () => void
    /** A request is in flight - the control rests rather than inviting a second press. */
    isPending?: boolean
    /**
     * This is one of many on a dense surface, so it must not compete with the surface's own
     * primary action. See the file header: this is a rule about the page, not a look.
     */
    isQuiet?: boolean
    /** The already-resolved words for the state that starts following. */
    followLabel: string
    /** The already-resolved words for the state that stops following. */
    followingLabel: string
}

/**
 * Draw the follow control.
 *
 * @param props - {@link FollowButtonProps}
 */
export const FollowButton = ({
    isFollowing,
    onToggle,
    isPending = false,
    isQuiet = false,
    followLabel,
    followingLabel,
}: FollowButtonProps) => (
    <Button
        variant={isQuiet ? "ghost" : (isFollowing ? "secondary" : "primary")}
        size="sm"
        isLoading={isPending}
        onClick={onToggle}
    >
        {isFollowing ? followingLabel : followLabel}
    </Button>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "block", name: "FollowButton" } as const
