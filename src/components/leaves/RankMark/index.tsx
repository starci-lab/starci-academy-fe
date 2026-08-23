import { skeletonVariants } from "@heroui/react"
import { Icon, type IconName } from "@/components/leaves/Icon"
import type { LeafProps } from "@/components/contracts/props"

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
export type RankMarkProps = LeafProps<RankMarkData>

const PLACE_MEDALS: Readonly<Record<number, IconName>> = {
    1: "rankFirst",
    2: "rankSecond",
    3: "rankThird",
}

const PLACEMENT_CLASSES = {
    standing: "size-7 shrink-0",
    row: "size-5 shrink-0",
} as const

const RESTING_CLASSES = {
    standing: skeletonVariants({ animationType: "shimmer" }).base({ className: "size-7 shrink-0 rounded-full" }),
    row: skeletonVariants({ animationType: "shimmer" }).base({ className: "size-5 shrink-0 rounded-full" }),
} as const

/** Resolve the exact Fluent Emoji Flat artwork ID for a one-based rank. */
export const RankMarkIconId = (rank: number): IconName =>
    PLACE_MEDALS[rank] ?? "rankOther"

/** Draw one closed rank artwork mark without exposing Iconify IDs to callers. */
export const RankMark = ({ props, isLoading = false }: RankMarkProps) => {
    const placement = props.placement
    if (isLoading || props.rank === undefined) {
        return (
            <span
                data-tier="leaf"
                data-component="RankMark"
                data-placement={placement}
                data-loading="true"
                aria-hidden="true"
                className={RESTING_CLASSES[placement]}
            />
        )
    }
    return (
        <span
            data-tier="leaf"
            data-component="RankMark"
            data-placement={placement}
            data-loading="false"
            data-icon={RankMarkIconId(props.rank)}
            aria-label={props.accessibleLabel}
            className={PLACEMENT_CLASSES[placement]}
        >
            <Icon props={{ name: RankMarkIconId(props.rank), role: placement === "standing" ? "heading" : "leading" }} />
        </span>
    )
}

/** Source-level tier marker. */
export const meta = { shape: "leaf", world: "pure" } as const
