import Image from "next/image"
import { MediaFrame } from "@starci/grammar/core"
import { DashboardSurfaceCard } from "@/components/blocks/dashboard/DashboardSurfaceCard"
import { TrendingContentRow, type TrendingContentRowData } from "@/components/composites/TrendingContentRow"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import {
    trendingContentClassName,
    trendingContentRowClassName,
    trendingListClassName,
    trendingMediaClassName,
    trendingSurfaceClassName,
} from "./classNames"
/** Trending list data. */
export type TrendingContentsData = { readonly label: string; readonly items: ReadonlyArray<TrendingContentRowData>; readonly emptyMessage?: string; readonly errorMessage?: string; readonly retryLabel?: string }
/** Trending row actions. */
export type TrendingContentsActions = { readonly [key: string]: (() => void) | undefined }
/** Trending state and data. */
export type TrendingContentsProps = { readonly state: "pending" | "empty" | "failed" | "ready"; readonly props: TrendingContentsData; readonly on?: TrendingContentsActions }
/** Draw trending content rows. */
export const TrendingContentsBase = (props: TrendingContentsProps) => {
    const content = props.state === "empty" || props.state === "failed"
        ? <EmptyNotice props={{ icon: "explore", message: props.state === "empty" ? props.props.emptyMessage ?? "" : props.props.errorMessage ?? "", actionLabel: props.state === "failed" ? props.props.retryLabel : undefined }} on={{ act: props.state === "failed" ? props.on?.retry : undefined }} />
        : (() => {
            const items = props.state === "pending" ? Array.from({ length: 4 }, (_, index) => ({ id: `resting-${index}` })) : props.props.items
            return items.map((item) => <div className={trendingContentRowClassName} data-dashboard-trending-row="true" key={item.id}><TrendingContentRow props={item} on={{ open: props.on?.[item.id] }} isLoading={props.state === "pending"} /></div>)
        })()
    return <div className={trendingSurfaceClassName}>
        <DashboardSurfaceCard props={{ label: props.props.label }}>
            <div className={trendingContentClassName}>
                <section aria-label={props.props.label} className={trendingListClassName}>{content}</section>
                <MediaFrame aspect="landscape" className={trendingMediaClassName} fit="contain">
                    <Image
                        alt=""
                        height={1024}
                        priority
                        sizes="(max-width: 1023px) min(84vw, 384px), 32vw"
                        src="/images/dashboard/explore-discovery-v1.png"
                        width={1536}
                    />
                </MediaFrame>
            </div>
        </DashboardSurfaceCard>
    </div>
}
