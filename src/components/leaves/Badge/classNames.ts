import { cn, skeletonVariants } from "@heroui/react"
/** Badge loading treatment. */
export const badgeLoadingClassName = cn("select-none", "text-transparent")
/** Badge placeholder styling preserves the chip's resting geometry while loading. */
export const badgeRestingClassName = skeletonVariants({ animationType: "shimmer" }).base({ className: badgeLoadingClassName })
