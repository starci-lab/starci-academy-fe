import { cn, skeletonVariants } from "@heroui/react"

/** Day cell layout. */
export const dayCellClassName = cn("flex", "flex-col", "items-center", "gap-1")
/** Resolve day dot state. */
export const getDayDotClassName = (active: boolean, loading: boolean) => cn("size-6", "shrink-0", "rounded-full", loading ? skeletonVariants({ animationType: "shimmer" }).base({ className: cn("select-none", "text-transparent") }) : active ? "bg-accent/80" : "bg-muted/20")
/** Weekday label. */
export const dayCellWeekdayClassName = cn("text-xs", "text-muted")
/** Screen-reader date. */
export const dayCellDateClassName = cn("sr-only")
