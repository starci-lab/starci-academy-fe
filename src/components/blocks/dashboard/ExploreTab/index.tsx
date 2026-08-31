import { FeedExplorer } from "@/components/blocks/dashboard/FeedExplorer"
import { exploreFeedPanelClassName, exploreTabClassName } from "./classNames"

/** Explore preserves legacy order and independent connected-block lifetimes. */
/** Props for the explore tab composition. */
export type ExploreTabProps = Record<string, never>
/** Connect the explore tab's feed and social blocks. */
export const ExploreTab = (props: ExploreTabProps) => { void props; return <div className={exploreTabClassName}><div className={exploreFeedPanelClassName}><FeedExplorer /></div></div> }
