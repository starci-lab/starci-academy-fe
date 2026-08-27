import { cn, skeletonVariants } from "@heroui/react"

/** Resolve cover frame styling. */
export const getCoverImageClassName = (ratio: "wide" | "thumb", loading: boolean) => cn("overflow-hidden", "rounded-2xl", "bg-surface-secondary", "aspect-video", ratio === "wide" ? "w-full" : "w-24", ratio === "thumb" ? "shrink-0" : undefined, loading ? skeletonVariants({ animationType: "shimmer" }).base() : undefined)
/** Cover image crop. */
export const coverImageContentClassName = cn("size-full", "object-cover")
