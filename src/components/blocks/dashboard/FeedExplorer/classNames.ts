import { cn } from "@heroui/react"
import { dashboardFlushSurfaceClassName } from "@/components/blocks/dashboard/classNames"

/** Remove Grammar content padding so the two internal bands meet the card edges. */
export const feedExplorerSurfaceClassName = cn(dashboardFlushSurfaceClassName, "w-full", "min-w-0")

/** Keep the two-tab control at the head of the Bulletin card at every width. */
export const feedExplorerClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
)

/** Fill the narrow card, then shrink the same two-tab control to its content on wider screens. */
export const feedExplorerNavigationClassName = cn(
    "min-w-0",
    "p-4",
    "[&>[data-slot=tabs]]:w-full",
    "md:[&>[data-slot=tabs]]:w-fit",
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
export const feedExplorerContinuationClassName = cn("flex", "items-center", "justify-between", "gap-3", "border-t", "border-separator", "p-4")
