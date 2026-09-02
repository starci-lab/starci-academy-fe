import { cn, skeletonVariants } from "@heroui/react"
import type { AvatarSize } from "."

/** Shimmer treatment for an avatar while its identity is loading. */
export const getRestingAvatarClassName = () => cn(
    skeletonVariants({ animationType: "shimmer" }).base({ className: "select-none text-transparent" }),
)

/** Keep the app-owned avatar size explicit instead of relying on a vendor's private classes. */
export const getAvatarClassName = (size: AvatarSize, isLoading: boolean) => cn(
    "avatar",
    `avatar--${size}`,
    isLoading && getRestingAvatarClassName(),
)

/** Cover the fallback avatar image without changing its intrinsic ratio. */
export const avatarFallbackClassName = cn("size-full", "object-cover")
