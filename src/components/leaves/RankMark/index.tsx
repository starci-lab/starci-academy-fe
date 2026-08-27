import { Icon, type IconName } from "@/components/leaves/Icon"
import { rankLoadingClassNames, rankPlacementClassNames } from "./classNames"

/** Where the closed rank artwork is being used. */
export type RankMarkPlacement = "standing" | "row"

/** Resolved rank artwork data. */
export type RankMarkData = {
    /** One-based leaderboard rank. */
    readonly rank?: number
    /** The fixed visual slot occupied by the artwork. */
    readonly placement: RankMarkPlacement
    /** Resolved accessible label retaining the numeric rank. */
    readonly accessibleLabel?: string
}

/** Props accepted by the closed rank-artwork leaf. */
export type RankMarkProps = { readonly props: RankMarkData; readonly isLoading?: boolean }

const PLACE_MEDALS: Readonly<Record<number, IconName>> = {
    1: "rankFirst",
    2: "rankSecond",
    3: "rankThird",
}


/** Resolve the exact Fluent Emoji Flat artwork ID for a one-based rank. */
export const RankMarkIconId = (rank: number): IconName =>
    PLACE_MEDALS[rank] ?? "rankOther"

/** Draw one closed rank artwork mark without exposing Iconify IDs to callers. */
export const RankMark = (props: RankMarkProps) => {
    const placement = props.props.placement
    if (props.isLoading === true || props.props.rank === undefined) {
        return (
            <span
                data-placement={placement}
                data-loading="true"
                aria-hidden="true"
                className={rankLoadingClassNames[placement]}
            />
        )
    }
    return (
        <span
            data-placement={placement}
            data-loading="false"
            data-icon={RankMarkIconId(props.props.rank)}
            aria-label={props.props.accessibleLabel}
            className={rankPlacementClassNames[placement]}
        >
            <Icon props={{ name: RankMarkIconId(props.props.rank), role: placement === "standing" ? "heading" : "leading" }} />
        </span>
    )
}
