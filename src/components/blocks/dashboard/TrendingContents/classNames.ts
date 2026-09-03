import { cn } from "@heroui/react"

/** Put the image above the list on compact screens and beside it on wide screens. */
export const trendingContentClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "lg:flex-row",
    "lg:items-stretch",
    "lg:justify-between",
)

/** Let the ranked destinations take the flexible side of the card. */
export const trendingListClassName = cn(
    "order-2",
    "min-w-0",
    "flex-1",
    "overflow-hidden",
    "border-t",
    "border-separator",
    "lg:order-1",
    "lg:border-t-0",
)

/** Keep generated discovery media prominent without becoming a separate card. */
export const trendingMediaClassName = cn(
    "order-1",
    "flex",
    "items-center",
    "justify-center",
    "w-full",
    "bg-accent-soft",
    "p-4",
    "lg:order-2",
    "lg:w-3/8",
    "lg:shrink-0",
    "lg:border-l",
    "lg:border-separator",
)

/**
 * Boundary and list-position inset for one ranked result; TrendingContentRow owns its own grid,
 * rank mark and title wrap. The extra 4px on `lg:first` completes the row's own 12px inset to the
 * card's 16px outer edge, matching the flush-band top/middle rhythm used elsewhere in this family.
 */
export const trendingContentRowClassName = cn(
    "min-w-0",
    "border-b",
    "border-separator",
    "bg-surface/90",
    "last:border-b-0",
    "lg:first:pt-1",
)
