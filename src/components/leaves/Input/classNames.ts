import { cn, skeletonVariants } from "@heroui/react"

/** Input wrapper layout. */
export const inputBoxClassName = cn("relative", "flex", "flex-row", "items-center")
/** Input loading shape. */
export const inputLoadingClassName = skeletonVariants({ animationType: "shimmer" }).base({ className: cn("h-10", "w-full") })
/** Password reveal affordance. */
export const inputRevealClassName = cn("absolute", "right-2", "top-1/2", "-translate-y-1/2", "cursor-pointer", "text-muted")
