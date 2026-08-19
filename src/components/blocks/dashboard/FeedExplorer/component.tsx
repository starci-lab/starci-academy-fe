import { Tree } from "@/components/branches/Tree"
import { ActivityFeed, type ActivityFeedConnectedProps } from "@/components/blocks/dashboard/ActivityFeed"
import { TrendingContents } from "@/components/blocks/dashboard/TrendingContents"
import { Button } from "@/components/leaves/Button"
import { Text } from "@/components/leaves/Text"
import { DualTabsToolbar, type DualTabsToolbarProps } from "@/components/composites/DualTabsToolbar"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"

/** Settled controls, feed state and pagination state for Explore. */
export type FeedExplorerData = {
    readonly filters: DualTabsToolbarProps["props"]
    readonly feed: Omit<ActivityFeedConnectedProps, "on">
    readonly loadMoreLabel: string
    readonly canLoadMore: boolean
    readonly isLoadingMore: boolean
    readonly loadMoreError?: string
    readonly retryLabel: string
}
/** Filter, activity and pagination journeys reported by Explore. */
export type FeedExplorerActions = {
    readonly selectScope?: (key: string) => void
    readonly selectCategory?: (key: string) => void
    readonly feed?: ActivityFeedConnectedProps["on"]
    readonly loadMore?: () => void
    readonly retryLoadMore?: () => void
}
/** Props for the pure feed-explorer block. */
export type FeedExplorerProps = { readonly props: FeedExplorerData; readonly on?: FeedExplorerActions }

/** Pure Explore feed arrangement. Requests and navigation stay in the connected half. */
export const FeedExplorerBase = (input: FeedExplorerProps) => (
    <Tree contract="feed-explorer" render={defineContractComponent("feed-explorer", {
        trending: defineContractProjection("trending-content-list", () => <TrendingContents />),
        stream: defineContractComponent("feed-stream", {
            filters: defineContractProjection("dual-tabs-toolbar", () => (
                <DualTabsToolbar props={input.props.filters} on={{
                    selectLeading: input.on?.selectScope,
                    selectTrailing: input.on?.selectCategory,
                }} />
            )),
            feed: defineContractProjection("activity-feed-result", () => (
                <ActivityFeed {...input.props.feed} on={input.on?.feed} />
            )),
            paginationError: input.props.loadMoreError === undefined ? undefined : defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: input.props.loadMoreError, size: "xs", tone: "muted" }} />
            )),
            pagination: input.props.canLoadMore || input.props.loadMoreError !== undefined ? defineLeafComponent("button", {}, () => (
                <Button
                    props={{ label: input.props.loadMoreError === undefined ? input.props.loadMoreLabel : input.props.retryLabel, size: "sm", variant: "ghost", isPending: input.props.isLoadingMore }}
                    on={{ press: input.props.loadMoreError === undefined ? input.on?.loadMore : input.on?.retryLoadMore }}
                />
            )) : undefined,
        }),
    })} />
)

/** Source-level ownership marker for the pure social block. */
export const meta = { world: "pure", domain: "social" } as const
