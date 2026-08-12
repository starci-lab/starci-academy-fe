import { Tree } from "@/components/branches/Tree"
import { FeedExplorer } from "@/components/blocks/dashboard/FeedExplorer"
import { WhoToFollow } from "@/components/blocks/dashboard/WhoToFollow"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"

/** Explore preserves legacy order and independent connected-block lifetimes. */
export const ExploreTab = () => (
    <Tree contract="explore-main" render={defineContractComponent("explore-main", {
        feed: defineContractProjection("feed-explorer", () => <FeedExplorer />),
        suggestions: defineContractProjection("suggested-user-list", () => <WhoToFollow />),
    })} />
)

/** Source-level ownership marker for the pure dashboard block. */
export const meta = { world: "pure", domain: "dashboard" } as const
