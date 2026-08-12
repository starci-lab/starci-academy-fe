import { CONTRACTS } from "@/components/contracts"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { SuggestedUserRow, type SuggestedUserRowData } from "@/components/composites/SuggestedUserRow"
import { defineCompositeComponent, defineContractComponent, type LeafProps } from "@/components/contracts/props"

/** Label and suggested identities drawn by the block. */
export type WhoToFollowData = SurfaceListCardData & { readonly users: ReadonlyArray<SuggestedUserRowData> }
/** Profile and follow journeys reported by suggested identities. */
export type WhoToFollowActions = { readonly [key: string]: (() => void) | undefined }
/** Props for the pure follow-suggestion block. */
export type WhoToFollowProps = { readonly state: "pending" | "hidden" | "ready"; readonly props: WhoToFollowData; readonly on?: WhoToFollowActions }

const COUNT = CONTRACTS["suggested-user-list"].children.user.restingCount
const SuggestedListView = ({ props, on, isLoading = false }: LeafProps<WhoToFollowData, WhoToFollowActions>) => {
    const users = isLoading ? Array.from({ length: COUNT }, (_, index) => ({
        id: `resting-${index}`,
        followLabel: "",
        followingLabel: "",
    })) : props.users
    return <Tree contract="suggested-user-list" render={defineContractComponent("suggested-user-list", {
        user: users.map((user) => defineCompositeComponent("suggested-user-row", {}, () => (
            <SuggestedUserRow props={user} on={{ open: on?.[`open:${user.id}`], follow: on?.[`follow:${user.id}`] }} isLoading={isLoading} />
        ))),
    })} />
}
const SuggestedList = defineContractComponent("suggested-user-list", SuggestedListView)

/** Draw the joined suggestion list while hiding settled absence. */
export const _WhoToFollow = (input: WhoToFollowProps) => input.state === "hidden" ? null : (
    <SurfaceListCard contract="suggested-user-list" render={SuggestedList} props={input.props} on={input.on} isLoading={input.state === "pending"} />
)
/** Source-level ownership marker for the pure social block. */
export const meta = { world: "pure", domain: "social" } as const
