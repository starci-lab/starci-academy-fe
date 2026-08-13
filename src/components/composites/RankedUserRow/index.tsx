import { Tree } from "@/components/branches/Tree"
import { Avatar } from "@/components/leaves/Avatar"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
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

/** Draw one ranked identity with one mutually exclusive movement or follow outcome. */
export const RankedUserRow = ({ props, on, isLoading = false }: CompositeProps<RankedUserRowData, RankedUserRowActions>) => {
    const contract = contractFor(props.verdict)
    const followLabel = props.followLabel
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
    const action = props.movementLabel !== undefined && (props.verdict !== undefined || isLoading)
        ? defineLeafComponent("badge", {}, () => (
            <Badge props={{ content: props.movementLabel, tone: props.verdict ?? "neutral" }} isLoading={isLoading} />
        ))
        : props.isMe !== true && followLabel !== undefined
            ? defineLeafComponent("button", {}, () => (
                <Button
                    props={{
                        label: props.isFollowing === true ? props.followingLabel ?? "" : followLabel,
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
            ...(action === undefined ? {} : { action }),
        })} />
    )
}

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
