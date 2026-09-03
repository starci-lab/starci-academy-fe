import { cn } from "@heroui/react"

/** Rank mark and title share one compact two-column row inset. */
export const trendingContentRowLayoutClassName = cn(
    "grid",
    "min-w-0",
    "grid-cols-[auto_1fr]",
    "items-start",
    "gap-3",
    "px-4",
    "py-3",
)

/** Fixed circular mark carrying the rank's own accent or muted tone. */
export const trendingContentRowMarkClassName = cn(
    "flex",
    "size-6",
    "shrink-0",
    "items-center",
    "justify-center",
    "rounded-full",
    "bg-accent/10",
)

/** Title wraps at the flexible column instead of overflowing it. */
export const trendingContentRowTitleClassName = cn("min-w-0", "break-words")
