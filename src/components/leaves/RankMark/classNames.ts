import { cn, skeletonVariants } from "@heroui/react"

/** Rank placement styling. */
export const rankPlacementClassNames = {
    standing: cn("inline-flex", "size-7", "shrink-0", "items-center", "justify-center", "text-sm", "font-medium", "text-foreground", "tabular-nums"),
    row: cn("inline-flex", "size-5", "shrink-0", "items-center", "justify-center", "text-xs", "font-medium", "text-foreground", "tabular-nums"),
} as const
/** Grammar artwork fills the fixed placement slot. */
export const rankArtworkClassName = cn("size-full")
/** Rank loading styling. */
export const rankLoadingClassNames = { standing: skeletonVariants({ animationType: "shimmer" }).base({ className: cn("size-7", "shrink-0", "rounded-full") }), row: skeletonVariants({ animationType: "shimmer" }).base({ className: cn("size-5", "shrink-0", "rounded-full") }) } as const
