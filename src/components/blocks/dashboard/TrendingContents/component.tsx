import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { TrendingContentRow, type TrendingContentRowData } from "@/components/composites/TrendingContentRow"
/** Trending list data. */
export type TrendingContentsData = { readonly label: string; readonly items: ReadonlyArray<TrendingContentRowData> }
/** Trending row actions. */
export type TrendingContentsActions = { readonly [key: string]: (() => void) | undefined }
/** Trending state and data. */
export type TrendingContentsProps = { readonly state: "pending" | "hidden" | "ready"; readonly props: TrendingContentsData; readonly on?: TrendingContentsActions }
/** Draw trending content rows. */
export const TrendingContentsBase = (props: TrendingContentsProps) => {
    if (props.state === "hidden") return null
    const items = props.state === "pending" ? Array.from({ length: 4 }, (_, index) => ({ id: `resting-${index}` })) : props.props.items
    return <SurfaceListCard props={{ label: props.props.label }} isLoading={props.state === "pending"}>{items.map((item) => <TrendingContentRow key={item.id} props={item} on={{ open: props.on?.[item.id] }} isLoading={props.state === "pending"} />)}</SurfaceListCard>
}
