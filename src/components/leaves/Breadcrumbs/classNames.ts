import { cn, skeletonVariants } from "@heroui/react"

/** Breadcrumb loading shape. */
export const breadcrumbsLoadingClassName = skeletonVariants({ animationType: "shimmer" }).base({ className: cn("h-4", "w-40", "rounded-sm") })
/** Back-link layout. */
export const breadcrumbsBackLinkClassName = cn("inline-flex", "max-w-full", "min-w-0", "items-center", "gap-1", "whitespace-normal", "break-words", "text-sm", "text-muted", "[&>svg]:shrink-0")
/** Full trail scrolling layout. */
export const breadcrumbsTrailClassName = cn(
    "w-full",
    "min-w-0",
    "overflow-x-auto",
    "[scrollbar-width:none]",
    "[&::-webkit-scrollbar]:hidden",
)
