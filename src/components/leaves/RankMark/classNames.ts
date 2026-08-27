import { cn, skeletonVariants } from "@heroui/react"

/** Rank placement styling. */
export const rankPlacementClassNames = { standing: cn("size-7", "shrink-0"), row: cn("size-5", "shrink-0") } as const
/** Rank loading styling. */
export const rankLoadingClassNames = { standing: skeletonVariants({ animationType: "shimmer" }).base({ className: cn("size-7", "shrink-0", "rounded-full") }), row: skeletonVariants({ animationType: "shimmer" }).base({ className: cn("size-5", "shrink-0", "rounded-full") }) } as const
