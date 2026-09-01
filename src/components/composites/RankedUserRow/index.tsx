import { Avatar } from "@/components/leaves/Avatar"
import { Button } from "@/components/leaves/Button"
import { RankDeltaCaret } from "@/components/leaves/RankDeltaCaret"
import { RankMark } from "@/components/leaves/RankMark"
import { Text } from "@/components/leaves/Text"
import { TextLink } from "@/components/leaves/TextLink"
import { getRankedUserVerdictClassName } from "./classNames"

/** Semantic movement verdict carried by leaderboard data. */
export type RankedUserVerdict = "success" | "danger"

/** Resolved rank, identity, points and trailing state. */
export type RankedUserRowData = {
    readonly id: string
    readonly rank?: number
    readonly rankLabel?: string
    readonly name?: string
    readonly avatar?: string | null
    readonly subtitle?: string
    readonly points?: string
    /**
     * Signed rank movement. Present means this row reports movement and never a follow control;
     * `null` is "no baseline last week" and `0` is "played and did not move".
     */
    readonly rankDelta?: number | null
    /** Resolved accessible movement sentence; the caret itself is never read aloud. */
    readonly movementLabel?: string
    readonly verdict?: RankedUserVerdict
    readonly followLabel?: string
    readonly followingLabel?: string
    readonly isFollowing?: boolean
    readonly isPending?: boolean
    readonly isMe?: boolean
}

/** Independent profile and follow actions for a ranked user. */
export type RankedUserRowActions = {
    readonly open?: () => void
    readonly follow?: () => void
}

/** Public inputs for a ranked identity row. */
export type RankedUserRowProps = { readonly props: RankedUserRowData; readonly on?: RankedUserRowActions; readonly isLoading?: boolean }

const RankedName = ({ props, on, isLoading }: RankedUserRowProps) => props.isMe === true
    ? <Text props={{ content: props.name, size: "sm", weight: "semibold", tone: props.isMe === true ? "accent" : "default" }} isLoading={isLoading} />
    : <TextLink props={{ label: props.name ?? "", size: "sm" }} on={{ press: on?.open }} isLoading={isLoading} />

const RankedMovement = ({ props, isLoading }: RankedUserRowProps) => props.rankDelta !== undefined
    ? <RankDeltaCaret props={{ delta: props.rankDelta, accessibleLabel: props.movementLabel }} isLoading={isLoading} />
    : <Text props={{ content: undefined, size: "sm" }} isLoading={isLoading} />

/**
 * Draw one ranked identity with one mutually exclusive movement or follow outcome.
 *
 * MOVEMENT IS A CARET, NOT A SENTENCE. An earlier version put the whole localized phrase for
 * "climbed one place" in a Badge, which is a different width on every row - so the points column
 * beside it stopped lining up, and a column that does not line up is the one thing a leaderboard
 * cannot afford. The caret is fixed width and the sentence survives as the accessible label.
 */
export const RankedUserRow = (props: RankedUserRowProps) => {
    const data = props.props
    const on = props.on
    const isLoading = props.isLoading ?? false
    // Movement and follow are no longer rivals for one slot: the leaderboard page shows both, and
    // the dashboard preview shows neither a follow control nor the space one would take.
    const followLabel = data.followLabel
    const showsFollow = data.isMe !== true && followLabel !== undefined
    const name = <RankedName props={data} on={on} isLoading={isLoading} />
    /*
     * MOVEMENT IS ALWAYS DRAWN, EVEN WHEN THERE IS NONE.
     *
     * The row is a grid and its slots are placed in declaration order, so a missing movement cell
     * would slide the follow control one column left - and the follow control on the global board,
     * which has no movement concept at all, would sit where the caret belongs on the weekly one.
     * An empty text holds the column open; it draws nothing and announces nothing.
     */
    const movement = <RankedMovement props={data} isLoading={isLoading} />
    const follow = showsFollow
        ? <Button
            props={{
                label: data.isFollowing === true
                    ? data.followingLabel ?? ""
                    : followLabel,
                size: "sm",
                variant: data.isFollowing === true ? "secondary" : "primary",
                isPending: data.isPending,
            }}
            on={{ press: on?.follow }}
            isLoading={isLoading}
        />
        : undefined
    return (
        <div className={getRankedUserVerdictClassName(data.verdict)} data-verdict={data.verdict}><RankMark
            props={{ rank: data.rank, placement: "row", accessibleLabel: data.rankLabel }}
            isLoading={isLoading}
        /><Avatar props={{ name: data.name, src: data.avatar ?? undefined, size: "sm" }} isLoading={isLoading} /><div>{name}{data.subtitle === undefined && !isLoading ? null : <Text props={{ content: data.subtitle, size: "xs", tone: "muted" }} isLoading={isLoading} />}</div><Text props={{ content: data.points, size: "xs", tone: "muted" }} isLoading={isLoading} />{movement}{follow}</div>
    )
}
