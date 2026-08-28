import { cn, skeletonVariants } from "@heroui/react"
/** Progress bar fills its available width. */
export const progressClassName = cn("w-full")
/** Loading progress placeholder keeps the bar height. */
export const progressLoadingClassName = cn("h-2", "w-full")
/** Progress placeholder styling preserves the bar geometry while loading. */
export const progressRestingClassName = skeletonVariants({ animationType: "shimmer" }).base({
    className: progressLoadingClassName,
})
