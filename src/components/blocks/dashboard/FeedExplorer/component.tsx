import { ActivityFeed, type ActivityFeedProps } from "@/components/blocks/dashboard/ActivityFeed"
import { DashboardSurfaceCard } from "@/components/blocks/dashboard/DashboardSurfaceCard"
import { Button } from "@/components/leaves/Button"
import { ChoiceTabs, type ChoiceTabsData } from "@/components/leaves/ChoiceTabs"
import { Text } from "@/components/leaves/Text"
import {
    feedExplorerActivityClassName,
    feedExplorerContinuationClassName,
    feedExplorerClassName,
    feedExplorerNavigationClassName,
    feedExplorerSurfaceClassName,
} from "./classNames"

/** Settled controls, feed state and pagination state for Explore. */
export type FeedExplorerData = {
    readonly label: string
    readonly scope: ChoiceTabsData
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
    readonly feed?: ActivityFeedProps["on"]
    readonly loadMore?: () => void
    readonly retryLoadMore?: () => void
}
/** Props for the pure feed-explorer block. */
export type FeedExplorerProps = { readonly props: FeedExplorerData; readonly on?: FeedExplorerActions }

/** Pure Explore feed arrangement. Requests and navigation stay in the connected half. */
export const FeedExplorerBase = (props: FeedExplorerProps) => (
    <div className={feedExplorerSurfaceClassName}>
        <DashboardSurfaceCard props={{ ariaLabel: props.props.label }}>
            <div className={feedExplorerClassName}>
                <nav className={feedExplorerNavigationClassName} aria-label={props.props.label}>
                    <ChoiceTabs props={{ ...props.props.scope, variant: "primary" }} on={{ select: props.on?.selectScope }} />
                </nav>
                <section className={feedExplorerActivityClassName} aria-label={props.props.label}>
                    <ActivityFeed {...props.props.feed} isFrameless on={props.on?.feed} />
                    {props.props.loadMoreError === undefined && !props.props.canLoadMore ? null : <div className={feedExplorerContinuationClassName}>
                        {props.props.loadMoreError === undefined ? null : <Text props={{ content: props.props.loadMoreError, size: "xs", tone: "muted" }} />}
                        {props.props.canLoadMore || props.props.loadMoreError !== undefined ? <Button
                            props={{ label: props.props.loadMoreError === undefined ? props.props.loadMoreLabel : props.props.retryLabel, size: "sm", variant: "ghost", isPending: props.props.isLoadingMore }}
                            on={{ press: props.props.loadMoreError === undefined ? props.on?.loadMore : props.on?.retryLoadMore }}
                        /> : null}
                    </div>}
                </section>
            </div>
        </DashboardSurfaceCard>
    </div>
)
