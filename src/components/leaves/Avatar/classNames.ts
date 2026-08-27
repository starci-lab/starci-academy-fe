import { cn, skeletonVariants } from "@heroui/react"

/** Shimmer treatment for an avatar while its identity is loading. */
export const getRestingAvatarClassName = () => cn(
    skeletonVariants({ animationType: "shimmer" }).base({ className: "select-none text-transparent" }),
)

/** Cover the fallback avatar image without changing its intrinsic ratio. */
export const avatarFallbackClassName = cn("size-full", "object-cover")
