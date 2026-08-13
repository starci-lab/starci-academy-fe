import { Avatar } from "@/components/leaves/Avatar"
import { Button } from "@/components/leaves/Button"
import { RankMark } from "@/components/leaves/RankMark"
import { Text } from "@/components/leaves/Text"
import { TextLink } from "@/components/leaves/TextLink"
import type { CompositeProps } from "@/components/contracts/props"
import { RankDeltaCaret } from "../../leaves/RankDeltaCaret"
import { defineContract, TreeCandidate } from "../../branches/Tree"

/**
 * TARGET PATH: src/components/composites/RankedUserRow/index.tsx  (REVISION of the locked file)
 *
 * WHAT CHANGES vs. the locked target:
 *   1. The trailing slot renders `RankDeltaCaret` instead of a Badge carrying a whole sentence.
 *   2. `subtitle` is gone. The locked version puts a "rank unchanged" caption under every unmoved
 *      name, which the legacy render does not have and which doubles every row's height.
 *
 * WHAT DOES NOT CHANGE: the contract, the slot order, the verdict inset variants, the viewer
 * treatment, and the rule that movement and follow are mutually exclusive at the row end.
 */

/** Semantic movement verdict carried by leaderboard data. */
export type RankedUserVerdict = "success" | "danger"

/** Resolved rank, identity, points and trailing state. */
export type RankedUserRowData = {
    readonly id: string
    readonly rank?: number
    readonly rankLabel?: string
    readonly name?: string
    readonly avatar?: string | null
    readonly points?: string
    /** Signed movement; when present the row shows a caret and never a follow control. */
    readonly rankDelta?: number | null
    /** Resolved accessible movement sentence. */
    readonly movementLabel?: string
    readonly verdict?: RankedUserVerdict
    readonly followLabel?: string
    readonly followingLabel?: string
    readonly isFollowing?: boolean
    readonly isPending?: boolean
    readonly isMe?: boolean
}

/** Independent profile and follow actions. */
export type RankedUserRowActions = {
    readonly open?: () => void
    readonly follow?: () => void
}

/** Props for {@link RankedUserRow}. */
export type RankedUserRowProps = CompositeProps<RankedUserRowData, RankedUserRowActions>

const contractFor = (verdict?: RankedUserVerdict) =>
    verdict === "success"
        ? "ranked-user-row-success-verdict"
        : verdict === "danger"
            ? "ranked-user-row-danger-verdict"
            : "ranked-user-row"

/** Draw one ranked identity with one mutually exclusive movement or follow outcome. */
export const RankedUserRow = ({ props, on, isLoading = false }: RankedUserRowProps) => {
    const showsMovement = props.rankDelta !== undefined
    const showsFollow = !showsMovement && props.isMe !== true && props.followLabel !== undefined
    const contract = contractFor(props.verdict)
    const action = showsMovement
        ? (
            <RankDeltaCaret
                key="action"
                props={{ delta: props.rankDelta, accessibleLabel: props.movementLabel }}
                isLoading={isLoading}
            />
        )
        : showsFollow
            ? (
                <Button
                    key="action"
                    props={{
                        label: props.isFollowing === true
                            ? props.followingLabel ?? ""
                            : props.followLabel ?? "",
                        size: "sm",
                        variant: props.isFollowing === true ? "secondary" : "primary",
                        isPending: props.isPending,
                    }}
                    on={{ press: on?.follow }}
                    isLoading={isLoading}
                />
            )
            : undefined
    return (
        <TreeCandidate
            contract={contract}
            render={defineContract(contract, [
                <RankMark
                    key="rank"
                    props={{ rank: props.rank, placement: "row", accessibleLabel: props.rankLabel }}
                    isLoading={isLoading}
                />,
                <Avatar
                    key="avatar"
                    props={{ name: props.name, src: props.avatar ?? undefined, size: "sm" }}
                    isLoading={isLoading}
                />,
                isLoading || props.isMe === true
                    ? (
                        <Text
                            key="identity"
                            props={{
                                content: props.name,
                                size: "sm",
                                weight: "semibold",
                                tone: props.isMe === true ? "accent" : "default",
                            }}
                            isLoading={isLoading}
                        />
                    )
                    : <TextLink key="identity" props={{ label: props.name ?? "", size: "sm" }} on={{ press: on?.open }} />,
                <Text
                    key="points"
                    props={{ content: props.points, size: "xs", tone: "muted" }}
                    isLoading={isLoading}
                />,
                ...(action === undefined ? [] : [action]),
            ])}
        />
    )
}

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
