import { ActivityFeed, type ActivityFeedProps } from "@/components/blocks/dashboard/ActivityFeed"
import { TrendingContents } from "@/components/blocks/dashboard/TrendingContents"
import { Button } from "@/components/leaves/Button"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { Text } from "@/components/leaves/Text"
import type { DualTabsToolbarProps } from "@/components/composites/DualTabsToolbar"
import { feedExplorerAxisClassName, feedExplorerStackClassName, feedExplorerToolbarClassName, feedExplorerToolbarViewportClassName } from "./classNames"

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
    <div className={feedExplorerStackClassName}><TrendingContents /><div className={feedExplorerStackClassName}>
        <div className={feedExplorerToolbarViewportClassName}><div className={feedExplorerToolbarClassName}>
            <section className={feedExplorerAxisClassName} aria-label={props.props.filters.leading.label}>
                <Text props={{ content: props.props.filters.leading.label, size: "xs", tone: "muted", weight: "semibold" }} />
                <ChoiceTabs props={{ ...props.props.filters.leading, variant: "primary" }} on={{ select: props.on?.selectScope }} />
            </section>
            <section className={feedExplorerAxisClassName} aria-label={props.props.filters.trailing.label}>
                <Text props={{ content: props.props.filters.trailing.label, size: "xs", tone: "muted", weight: "semibold" }} />
                <ChoiceTabs props={{ ...props.props.filters.trailing, variant: "primary" }} on={{ select: props.on?.selectCategory }} />
            </section>
        </div></div>
        <ActivityFeed {...props.props.feed} on={props.on?.feed} />
        {props.props.loadMoreError === undefined ? null : <Text props={{ content: props.props.loadMoreError, size: "xs", tone: "muted" }} />}
        {props.props.canLoadMore || props.props.loadMoreError !== undefined ? <Button
            props={{ label: props.props.loadMoreError === undefined ? props.props.loadMoreLabel : props.props.retryLabel, size: "sm", variant: "ghost", isPending: props.props.isLoadingMore }}
            on={{ press: props.props.loadMoreError === undefined ? props.on?.loadMore : props.on?.retryLoadMore }}
        /> : null}</div></div>
)
