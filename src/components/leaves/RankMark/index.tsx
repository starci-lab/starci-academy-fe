import { Icon as IconifyIcon } from "@iconify/react"
import { skeletonVariants } from "@heroui/react"
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

const PLACE_MEDALS: Readonly<Record<number, string>> = {
    1: "fluent-emoji-flat:1st-place-medal",
    2: "fluent-emoji-flat:2nd-place-medal",
    3: "fluent-emoji-flat:3rd-place-medal",
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
export const RankMarkIconId = (rank: number): string =>
    PLACE_MEDALS[rank] ?? "fluent-emoji-flat:trophy"

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
        <IconifyIcon
            data-tier="leaf"
            data-component="RankMark"
            data-placement={placement}
            data-loading="false"
            icon={RankMarkIconId(props.rank)}
            aria-label={props.accessibleLabel}
            className={PLACEMENT_CLASSES[placement]}
        />
    )
}

/** Source-level tier marker. */
export const meta = { shape: "leaf", world: "pure" } as const
