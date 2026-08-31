import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { TrendingContentRow, type TrendingContentRowData } from "@/components/composites/TrendingContentRow"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { trendingContentRowClassName } from "./classNames"
/** Trending list data. */
export type TrendingContentsData = { readonly label: string; readonly items: ReadonlyArray<TrendingContentRowData>; readonly emptyMessage?: string; readonly errorMessage?: string; readonly retryLabel?: string }
/** Trending row actions. */
export type TrendingContentsActions = { readonly [key: string]: (() => void) | undefined }
/** Trending state and data. */
export type TrendingContentsProps = { readonly state: "pending" | "empty" | "failed" | "ready"; readonly props: TrendingContentsData; readonly on?: TrendingContentsActions }
/** Draw trending content rows. */
export const TrendingContentsBase = (props: TrendingContentsProps) => {
    if (props.state === "empty" || props.state === "failed") return <SurfaceListCard props={{ label: props.props.label }}><EmptyNotice props={{ icon: "explore", message: props.state === "empty" ? props.props.emptyMessage ?? "" : props.props.errorMessage ?? "", actionLabel: props.state === "failed" ? props.props.retryLabel : undefined }} on={{ act: props.state === "failed" ? props.on?.retry : undefined }} /></SurfaceListCard>
    const items = props.state === "pending" ? Array.from({ length: 4 }, (_, index) => ({ id: `resting-${index}` })) : props.props.items
    return <SurfaceListCard props={{ label: props.props.label }} isLoading={props.state === "pending"}>{items.map((item) => <div className={trendingContentRowClassName} data-dashboard-trending-row="true" key={item.id}><TrendingContentRow props={item} on={{ open: props.on?.[item.id] }} isLoading={props.state === "pending"} /></div>)}</SurfaceListCard>
}
