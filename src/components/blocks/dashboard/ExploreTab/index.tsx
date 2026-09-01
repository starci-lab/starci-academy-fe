import { TrendingContents } from "@/components/blocks/dashboard/TrendingContents"
import { exploreTabClassName } from "./classNames"

/** Explore preserves legacy order and independent connected-block lifetimes. */
/** Props for the explore tab composition. */
export type ExploreTabProps = Record<string, never>
/** Connect the Explore destination to its prominent content. */
export const ExploreTab = (props: ExploreTabProps) => {
    void props
    return <div className={exploreTabClassName}><TrendingContents /></div>
}
