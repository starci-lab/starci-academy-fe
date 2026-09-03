import { cn } from "@heroui/react"

/** Rank mark and title share one compact two-column row inset. */
export const trendingContentRowLayoutClassName = cn(
    "flex",
    "min-w-0",
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

/** Title owns the row's spare width and wraps inside it instead of overflowing. */
export const trendingContentRowTitleClassName = cn("min-w-0", "flex-1", "break-words")
