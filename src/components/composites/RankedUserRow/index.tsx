import { Tree } from "@/components/branches/Tree"
import { Button } from "@/components/leaves/Button"
import { Text } from "@/components/leaves/Text"
import { TextLink } from "@/components/leaves/TextLink"
import { defineContractComponent, defineLeafComponent, type CompositeProps } from "@/components/contracts/props"
/** Resolved rank, identity, points and follow state. */
export type RankedUserRowData = { readonly id: string; readonly rank?: string; readonly name?: string; readonly subtitle?: string; readonly points?: string; readonly followLabel?: string; readonly followingLabel?: string; readonly isFollowing?: boolean; readonly isPending?: boolean; readonly isMe?: boolean }
/** Independent profile and follow actions for a ranked user. */
export type RankedUserRowActions = { readonly open?: () => void; readonly follow?: () => void }
/** Draw one ranked identity with an optional follow action. */
export const RankedUserRow = ({ props, on, isLoading = false }: CompositeProps<RankedUserRowData, RankedUserRowActions>) => {
    const identity = defineContractComponent("name-over-handle", {
        name: defineLeafComponent("text-link", { size: "sm" }, () => <TextLink props={{ label: props.name ?? "", size: "sm" }} on={{ press: on?.open }} />),
        handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.subtitle, size: "xs", tone: "muted" }} isLoading={isLoading} />),
    })
    return <Tree contract="ranked-user-row" render={defineContractComponent("ranked-user-row", {
        rank: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: props.rank, size: "sm", weight: "semibold", tone: Number(props.rank) <= 3 ? "accent" : "muted" }} isLoading={isLoading} />), identity,
        points: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.points, size: "xs", tone: "muted" }} isLoading={isLoading} />),
        ...(props.isMe === true ? {} : { action: defineLeafComponent("button", {}, () => <Button props={{ label: props.isFollowing === true ? props.followingLabel ?? "" : props.followLabel ?? "", size: "sm", variant: props.isFollowing === true ? "secondary" : "primary", isPending: props.isPending }} on={{ press: on?.follow }} isLoading={isLoading} />) }),
    })} />
}
/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
