import { ActivityFeed, type ActivityFeedProps } from "@/components/blocks/dashboard/ActivityFeed"
import { TrendingContents } from "@/components/blocks/dashboard/TrendingContents"
import { Button } from "@/components/leaves/Button"
import { Text } from "@/components/leaves/Text"
import { DualTabsToolbar, type DualTabsToolbarProps } from "@/components/composites/DualTabsToolbar"

/** Settled controls, feed state and pagination state for Explore. */
export type FeedExplorerData = {
    readonly filters: DualTabsToolbarProps["props"]
    readonly feed: Omit<ActivityFeedProps, "on">
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
    readonly feed?: ActivityFeedProps["on"]
    readonly loadMore?: () => void
    readonly retryLoadMore?: () => void
}
/** Props for the pure feed-explorer block. */
export type FeedExplorerProps = { readonly props: FeedExplorerData; readonly on?: FeedExplorerActions }

/** Pure Explore feed arrangement. Requests and navigation stay in the connected half. */
export const FeedExplorerBase = (props: FeedExplorerProps) => (
    <div><TrendingContents /><div>
        <DualTabsToolbar props={props.props.filters} on={{
            selectLeading: props.on?.selectScope,
            selectTrailing: props.on?.selectCategory,
        }} />
        <ActivityFeed {...props.props.feed} on={props.on?.feed} />
        {props.props.loadMoreError === undefined ? null : <Text props={{ content: props.props.loadMoreError, size: "xs", tone: "muted" }} />}
        {props.props.canLoadMore || props.props.loadMoreError !== undefined ? <Button
            props={{ label: props.props.loadMoreError === undefined ? props.props.loadMoreLabel : props.props.retryLabel, size: "sm", variant: "ghost", isPending: props.props.isLoadingMore }}
            on={{ press: props.props.loadMoreError === undefined ? props.on?.loadMore : props.on?.retryLoadMore }}
        /> : null}</div></div>
)
