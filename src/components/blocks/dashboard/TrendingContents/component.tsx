import { CONTRACTS } from "@/components/contracts"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { TrendingContentRow, type TrendingContentRowData } from "@/components/composites/TrendingContentRow"
import { defineCompositeComponent, defineContractComponent, type LeafProps } from "@/components/contracts/props"

/** Label and ranked content rows drawn by the trending block. */
export type TrendingContentsData = SurfaceListCardData & { readonly items: ReadonlyArray<TrendingContentRowData> }
/** Per-content navigation reported by the trending block. */
export type TrendingContentsActions = { readonly [key: string]: (() => void) | undefined }
/** Props for the pure trending-content block. */
export type TrendingContentsProps = { readonly state: "pending" | "hidden" | "ready"; readonly props: TrendingContentsData; readonly on?: TrendingContentsActions }

const COUNT = CONTRACTS["trending-content-list"].children.item.restingCount
const TrendingListView = ({ props, on, isLoading = false }: LeafProps<TrendingContentsData, TrendingContentsActions>) => {
    const items = isLoading ? Array.from({ length: COUNT }, (_, index) => ({ id: `resting-${index}` })) : props.items
    return <Tree contract="trending-content-list" render={defineContractComponent("trending-content-list", {
        item: items.map((item) => defineCompositeComponent("trending-content-row", {}, () => (
            <TrendingContentRow props={item} on={{ open: on?.[item.id] }} isLoading={isLoading} />
        ))),
    })} />
}
const TrendingList = defineContractComponent("trending-content-list", TrendingListView)

/** Draw the ranked joined list while hiding settled absence. */
export const TrendingContentsBase = (input: TrendingContentsProps) => input.state === "hidden" ? null : (
    <SurfaceListCard contract="trending-content-list" render={TrendingList} props={input.props} on={input.on} isLoading={input.state === "pending"} />
)
/** Source-level ownership marker for the pure discovery block. */
export const meta = { world: "pure", domain: "discovery" } as const
