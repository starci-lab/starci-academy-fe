import { cn, skeletonVariants } from "@heroui/react"

/** League award plate. */
export const leagueTileClassName = cn("inline-flex", "size-12", "shrink-0", "items-center", "justify-center", "rounded-2xl", "bg-accent-soft", "text-accent-soft-foreground")
/** League loading plate. */
export const leagueTileLoadingClassName = skeletonVariants({ animationType: "shimmer" }).base({ className: cn("inline-flex", "size-12", "shrink-0", "rounded-2xl") })
