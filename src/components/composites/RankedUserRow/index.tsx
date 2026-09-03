import { Avatar } from "@/components/leaves/Avatar"
import { Button } from "@starci/grammar/common"
import { RankDeltaCaret } from "@/components/leaves/RankDeltaCaret"
import { RankMark } from "@/components/leaves/RankMark"
import { Text } from "@starci/grammar/common"
import {
    getRankedUserFollowColumnClassName,
    getRankedUserMovementColumnClassName,
    getRankedUserRowClassName,
    rankedUserNameColumnClassName,
    rankedUserPointsColumnClassName,
} from "./classNames"
import { TextAction } from "@starci/grammar/common"


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

/** Public inputs for a ranked identity row. `layout` defers the movement/follow columns below `sm` on a narrow rail card. */
export type RankedUserRowProps = { readonly props: RankedUserRowData; readonly on?: RankedUserRowActions; readonly isLoading?: boolean; readonly layout?: "full" | "compact" }

const RankedName = ({ props, on, isLoading }: RankedUserRowProps) => props.isMe === true
    ? <Text size={"sm"} tone={props.isMe === true ? "accent" : "default"} weight={"semibold"} overflow={"truncate"} isSkeleton={isLoading}>{props.name}</Text>
    : <TextAction size={"sm"} appearance="inline" isSkeleton={isLoading} onPress={on?.open}>{props.name ?? ""}</TextAction>

const RankedMovement = ({ props, isLoading }: RankedUserRowProps) => props.rankDelta !== undefined
    ? <RankDeltaCaret props={{ delta: props.rankDelta, accessibleLabel: props.movementLabel }} isLoading={isLoading} />
    : <Text size={"sm"} isSkeleton={isLoading}>{undefined}</Text>

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
    const layout = props.layout ?? "full"
    // Movement and follow are no longer rivals for one slot: the leaderboard page shows both, and
    // the dashboard preview shows neither a follow control nor the space one would take.
    const followLabel = data.followLabel
    const showsFollow = data.isMe !== true && followLabel !== undefined
    const name = <RankedName props={data} on={on} isLoading={isLoading} />
    /*
     * MOVEMENT IS ALWAYS DRAWN, EVEN WHEN THERE IS NONE.
     *
     * The row is a flex line and its cells sit in declaration order, so a missing movement cell
     * would slide the follow control one place left - and the follow control on the global board,
     * which has no movement concept at all, would sit where the caret belongs on the weekly one.
     * An empty text holds the column open; it draws nothing and announces nothing.
     */
    const movement = <RankedMovement props={data} isLoading={isLoading} />
    const follow = showsFollow
        ? <Button variant={data.isFollowing === true ? "secondary" : "primary"} size={"sm"} isPending={data.isPending} isSkeleton={isLoading} onPress={({ press: on?.follow })?.press}>{data.isFollowing === true
            ? data.followingLabel ?? ""
            : followLabel}</Button>
        : undefined
    return (
        <div
            className={getRankedUserRowClassName(layout)}
            data-verdict={data.verdict}
        ><RankMark
                props={{ rank: data.rank, placement: "row", accessibleLabel: data.rankLabel }}
                isLoading={isLoading}
            /><Avatar props={{ name: data.name, src: data.avatar ?? undefined, size: "sm" }} isLoading={isLoading} /><div className={rankedUserNameColumnClassName}>{name}{data.subtitle === undefined && !isLoading ? null : <Text size={"xs"} tone={"muted"} overflow={"truncate"} isSkeleton={isLoading}>{data.subtitle}</Text>}</div><div className={rankedUserPointsColumnClassName}><Text size={"xs"} tone={"muted"} isSkeleton={isLoading}>{data.points}</Text></div><span className={getRankedUserMovementColumnClassName(layout)}>{movement}</span>{follow === undefined ? null : <span className={getRankedUserFollowColumnClassName(layout)}>{follow}</span>}</div>
    )
}
