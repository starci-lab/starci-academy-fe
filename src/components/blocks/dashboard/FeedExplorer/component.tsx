import { ActivityFeed, type ActivityFeedProps } from "@/components/blocks/dashboard/ActivityFeed"
import { SurfaceCard } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"
import { ChoiceTabs, type ChoiceTabsData } from "@/components/leaves/ChoiceTabs"
import { Text } from "@starci/grammar/common"
import {
    feedExplorerActivityClassName,
    feedExplorerContinuationClassName,
    feedExplorerClassName,
    feedExplorerNavigationClassName,
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
    <SurfaceCard ariaLabel={props.props.label} composition={"joined"}>
        <div className={feedExplorerClassName}>
            <nav className={feedExplorerNavigationClassName} aria-label={props.props.label}>
                <ChoiceTabs props={{ ...props.props.scope, variant: "primary", fitWidthFrom: "md" }} on={{ select: props.on?.selectScope }} />
            </nav>
            <section className={feedExplorerActivityClassName} aria-label={props.props.label}>
                <ActivityFeed {...props.props.feed} isFrameless hasTrailingContent={props.props.loadMoreError !== undefined || props.props.canLoadMore} on={props.on?.feed} />
                {props.props.loadMoreError === undefined && !props.props.canLoadMore ? null : <div className={feedExplorerContinuationClassName}>
                    {props.props.loadMoreError === undefined ? null : <Text size={"xs"} tone={"muted"}>{props.props.loadMoreError}</Text>}
                    {props.props.canLoadMore || props.props.loadMoreError !== undefined ? <Button variant="ghost" size="sm" isPending={props.props.isLoadingMore} onPress={props.props.loadMoreError === undefined ? props.on?.loadMore : props.on?.retryLoadMore}>{props.props.loadMoreError === undefined ? props.props.loadMoreLabel : props.props.retryLabel}</Button> : null}
                </div>}
            </section>
        </div>
    </SurfaceCard>
)
