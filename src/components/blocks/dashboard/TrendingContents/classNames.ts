import { cn } from "@heroui/react"
import { dashboardFlushSurfaceClassName } from "@/components/blocks/dashboard/classNames"

/** Keep the external label owned by Grammar while the body fills the card. */
export const trendingSurfaceClassName = cn(dashboardFlushSurfaceClassName, "w-full", "min-w-0")

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
    "[&_.starci-core-media-viewport]:border-0",
    "[&_.starci-core-media-viewport]:bg-transparent",
    "lg:order-2",
    "lg:w-[38%]",
    "lg:shrink-0",
    "lg:border-l",
    "lg:border-separator",
)

/** Keep rank and title as a compact, wrapping two-column result inside the local list surface. */
export const trendingContentRowClassName = cn(
    "min-w-0",
    "border-b",
    "border-separator",
    "bg-surface/90",
    "px-3",
    "py-2.5",
    "transition-colors",
    "last:border-b-0",
    "hover:bg-accent/5",
    "first:bg-surface",
    "[&>div]:grid",
    "[&>div]:min-w-0",
    "[&>div]:grid-cols-[auto_1fr]",
    "[&>div]:items-start",
    "[&>div]:gap-3",
    "[&>div>div]:min-w-0",
    "[&>div>div:first-child]:flex",
    "[&>div>div:first-child]:size-6",
    "[&>div>div:first-child]:shrink-0",
    "[&>div>div:first-child]:items-center",
    "[&>div>div:first-child]:justify-center",
    "[&>div>div:first-child]:rounded-full",
    "[&>div>div:first-child]:bg-accent/10",
    "[&>div>div:last-child]:break-words",
)
