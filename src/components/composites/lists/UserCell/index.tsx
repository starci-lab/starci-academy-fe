import { Avatar } from "@/components/atoms/Avatar"
import { Text } from "@/components/atoms/Text"
import { Tree } from "@/components/frames/Tree"
import type { ContractSlot } from "@/components/contracts"

/**
 * COMPOSITE - `UserCell`: a person, identified.
 *
 * PORTED FROM THE LIVE PRODUCT, where the same three parts identify a learner in every list they
 * appear in - a leaderboard, a follow list, a comment, a member table. Keeping them one component
 * is what stops the same person being drawn four slightly different ways on four screens.
 *
 * THE NAME IS THE IDENTITY, THE PICTURE IS DECORATION ON TOP OF IT. The avatar takes the name and
 * falls back to initials, so there is no code path that renders an anonymous circle - the atom
 * makes that impossible, and this component inherits it by handing the name down rather than
 * building an image of its own.
 *
 * THE TRAILING SLOT IS WHERE A LIST PUTS ITS OWN BUSINESS. A follow button, a rank, a role - the
 * thing that differs per list, passed uncalled so the resting flag reaches it. Everything before
 * it is the same on every screen, which is the point.
 *
 * A HANDLE AND A TRAILING CONTROL CANNOT BOTH BE DRAWN, and that is a registry finding rather
 * than a limitation of this file. The row is a `card-header`: a glyph, a name that takes the
 * slack, and ONE trailing fact. Showing the handle UNDER the name needs a two-line identity - a
 * vertical pair at a tighter seam than any key here declares - so the handle takes the trailing
 * position when no control wants it, and a caller that needs both is asking for a key that does
 * not exist yet. It is recorded as a request rather than spent, because nothing renders it today.
 */

/** Props for {@link UserCell}. */
export interface UserCellProps {
    /** The already-resolved display name. It is the identity: it seeds the initials and the alt text. */
    name: string
    /** The handle or supporting line under the name, already resolved. */
    handle?: string
    /** The picture, when there is one. Without it the avatar falls back to initials. */
    avatarSrc?: string
    /**
     * What this list puts at the end of the row - a rank, a role, a control. Passed uncalled so
     * the resting flag reaches inside it rather than stopping at a node already built.
     */
    trailing?: ContractSlot
    /** Nothing to show YET - the first load of the request this person came from. */
    isLoading?: boolean
}

/**
 * Draw one person.
 *
 * @param props - {@link UserCellProps}
 */
export const UserCell = ({ name, handle, avatarSrc, trailing, isLoading = false }: UserCellProps) => {
    /** The `media` role: the picture, or the initials it falls back to. */
    const Media = () => <Avatar name={name} src={avatarSrc} size="sm" isLoading={isLoading} />

    /**
     * The `heading` role: the name.
     *
     * The row's contract gives this middle child the slack, so a long name clips rather than
     * pushing whatever trails it off the end of the line.
     */
    const Identity = () => (
        <Text size="sm" weight="medium" isLoading={isLoading}>
            {name}
        </Text>
    )

    /**
     * The `meta` role: what this list puts at the end - or, when it puts nothing there, the
     * handle. See the file header for why the two cannot share the position.
     */
    const Trailing = trailing ?? (() => (
        <Text tone="muted" size="sm" isLoading={isLoading}>
            {handle ?? ""}
        </Text>
    ))

    return <Tree contract="card-header" slots={{ media: Media, heading: Identity, meta: Trailing }} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "composite", name: "UserCell" } as const
