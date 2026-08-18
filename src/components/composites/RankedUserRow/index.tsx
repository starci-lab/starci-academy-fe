import { Tree } from "@/components/branches/Tree"
import { Avatar } from "@/components/leaves/Avatar"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { RankDeltaCaret } from "@/components/leaves/RankDeltaCaret"
import { RankMark } from "@/components/leaves/RankMark"
import { Text } from "@/components/leaves/Text"
import { TextLink } from "@/components/leaves/TextLink"
import {
    defineContractComponent,
    defineLeafComponent,
    type CompositeProps,
} from "@/components/contracts/props"
import type { ContractKey } from "@/components/contracts"

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

const contractFor = (verdict?: RankedUserVerdict): ContractKey => {
    if (verdict === "success") return "ranked-user-row-success-verdict"
    if (verdict === "danger") return "ranked-user-row-danger-verdict"
    return "ranked-user-row"
}

/**
 * Draw one ranked identity with one mutually exclusive movement or follow outcome.
 *
 * MOVEMENT IS A CARET, NOT A SENTENCE. An earlier version put the whole localized phrase for
 * "climbed one place" in a Badge, which is a different width on every row - so the points column
 * beside it stopped lining up, and a column that does not line up is the one thing a leaderboard
 * cannot afford. The caret is fixed width and the sentence survives as the accessible label.
 */
export const RankedUserRow = ({ props, on, isLoading = false }: CompositeProps<RankedUserRowData, RankedUserRowActions>) => {
    const contract = contractFor(props.verdict)
    const showsMovement = props.rankDelta !== undefined
    // Movement and follow are no longer rivals for one slot: the leaderboard page shows both, and
    // the dashboard preview shows neither a follow control nor the space one would take.
    const followLabel = props.followLabel
    const showsFollow = props.isMe !== true && followLabel !== undefined
    const name = isLoading || props.isMe === true
        ? defineLeafComponent("text", {}, () => (
            <Text
                props={{
                    content: props.name,
                    size: "sm",
                    weight: "semibold",
                    tone: props.isMe === true ? "accent" : "default",
                }}
                isLoading={isLoading}
            />
        ))
        : defineLeafComponent("text-link", {}, () => (
            <TextLink props={{ label: props.name ?? "", size: "sm" }} on={{ press: on?.open }} />
        ))
    const identity = defineContractComponent("ranked-user-name-over-subtitle", {
        name,
        ...((props.subtitle === undefined && !isLoading) ? {} : {
            subtitle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: props.subtitle, size: "xs", tone: "muted" }} isLoading={isLoading} />
            )),
        }),
    })
    /*
     * MOVEMENT IS ALWAYS DRAWN, EVEN WHEN THERE IS NONE.
     *
     * The row is a grid and its slots are placed in declaration order, so a missing movement cell
     * would slide the follow control one column left - and the follow control on the global board,
     * which has no movement concept at all, would sit where the caret belongs on the weekly one.
     * An empty text holds the column open; it draws nothing and announces nothing.
     */
    const movement = showsMovement
        ? defineLeafComponent("rank-delta-caret", {}, () => (
            <RankDeltaCaret
                props={{ delta: props.rankDelta, accessibleLabel: props.movementLabel }}
                isLoading={isLoading}
            />
        ))
        : isLoading
            ? defineLeafComponent("badge", {}, () => (
                <Badge props={{ content: props.movementLabel, tone: "neutral" }} isLoading />
            ))
            : defineLeafComponent("text", {}, () => <Text props={{ content: undefined, size: "sm" }} />)
    const follow = showsFollow
        ? defineLeafComponent("button", {}, () => (
            <Button
                props={{
                    label: props.isFollowing === true
                        ? props.followingLabel ?? ""
                        : followLabel,
                    size: "sm",
                    variant: props.isFollowing === true ? "secondary" : "primary",
                    isPending: props.isPending,
                }}
                on={{ press: on?.follow }}
                isLoading={isLoading}
            />
        ))
        : undefined
    return (
        <Tree contract={contract} render={defineContractComponent(contract, {
            rank: defineLeafComponent("rank-mark", { placement: "row" }, () => (
                <RankMark
                    props={{ rank: props.rank, placement: "row", accessibleLabel: props.rankLabel }}
                    isLoading={isLoading}
                />
            )),
            avatar: defineLeafComponent("avatar", {}, () => (
                <Avatar props={{ name: props.name, src: props.avatar ?? undefined, size: "sm" }} isLoading={isLoading} />
            )),
            identity,
            points: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: props.points, size: "xs", tone: "muted" }} isLoading={isLoading} />
            )),
            movement,
            ...(follow === undefined ? {} : { follow }),
        })} />
    )
}

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
