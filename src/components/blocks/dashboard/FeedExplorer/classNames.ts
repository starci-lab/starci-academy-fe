import { cn } from "@heroui/react"

/** Keep the two-tab control at the head of the Bulletin card at every width. */
export const feedExplorerClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
)

/** Fill the narrow card, then shrink the same two-tab control to its content on wider screens. */
export const feedExplorerNavigationClassName = cn(
    "min-w-0",
    "px-4",
    "pt-4",
    "pb-3",
)

/** The dated feed and its continuation state share the card without a second tab layer. */
export const feedExplorerActivityClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "border-t",
    "border-separator",
)

/** Separate pagination and recovery from the final dated row inside the same card. */
export const feedExplorerContinuationClassName = cn("flex", "items-center", "justify-between", "gap-3", "border-t", "border-separator", "px-4", "pt-3", "pb-4")
