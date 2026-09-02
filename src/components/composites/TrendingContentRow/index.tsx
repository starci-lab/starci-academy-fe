import { PressableSurface } from "@/components/branches/PressableSurface"
import { Text } from "@starci/grammar/common"

/** Rank and title for one trending result. */
export type TrendingContentRowData = {
    readonly id: string
    readonly rank?: string
    readonly title?: string
    readonly isTopRank?: boolean
}
/** Journey reported when the reader opens the ranked result. */
export type TrendingContentRowActions = { readonly open?: () => void }
/** Props for the closed ranked-result composition. */
export type TrendingContentRowProps = { readonly props: TrendingContentRowData; readonly on?: TrendingContentRowActions; readonly isLoading?: boolean }

/** Draw one ranked whole-row destination; the first three ranks retain the legacy accent treatment. */
export const TrendingContentRow = (props: TrendingContentRowProps) => (
    <PressableSurface
        disabled={props.isLoading === true}
        label={props.props.title ?? "Trending content"}
        press={props.on?.open}
        hover="surface"
    >
        <div>
            <Text size={"sm"} tone={props.props.isTopRank === true ? "accent" : "muted"} weight={"semibold"} isSkeleton={props.isLoading ?? false}>{props.props.rank}</Text>
            <Text size={"sm"} weight={"semibold"} isSkeleton={props.isLoading ?? false}>{props.props.title ?? ""}</Text>
        </div>
    </PressableSurface>
)
