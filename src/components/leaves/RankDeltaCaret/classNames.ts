import { cn, skeletonVariants } from "@heroui/react"

/** Rank movement styling. */
export const rankDeltaCaretClassNames = { up: cn("w-9", "shrink-0", "text-right", "text-xs", "font-semibold", "tabular-nums", "text-success"), down: cn("w-9", "shrink-0", "text-right", "text-xs", "font-semibold", "tabular-nums", "text-danger"), flat: cn("w-9", "shrink-0", "text-right", "text-xs", "font-semibold", "tabular-nums", "text-muted") } as const
/** Loading shape. */
export const rankDeltaCaretLoadingClassName = skeletonVariants({ animationType: "shimmer" }).base({ className: cn("h-3", "w-9", "shrink-0", "rounded-sm") })
