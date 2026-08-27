import { cn, skeletonVariants } from "@heroui/react"

/** Podium place styles. */
export const podiumPlaceClassNames = { 1: cn("flex", "w-20", "items-center", "justify-center", "rounded-t-2xl", "bg-default", "text-base", "font-bold", "h-16", "ring-2", "ring-accent"), 2: cn("flex", "w-20", "items-center", "justify-center", "rounded-t-2xl", "bg-default", "text-base", "font-bold", "h-11"), 3: cn("flex", "w-20", "items-center", "justify-center", "rounded-t-2xl", "bg-default", "text-base", "font-bold", "h-8") } as const
/** Podium loading styles. */
export const podiumLoadingClassNames = { 1: skeletonVariants({ animationType: "shimmer" }).base({ className: cn("flex", "h-16", "w-20", "rounded-t-2xl") }), 2: skeletonVariants({ animationType: "shimmer" }).base({ className: cn("flex", "h-11", "w-20", "rounded-t-2xl") }), 3: skeletonVariants({ animationType: "shimmer" }).base({ className: cn("flex", "h-8", "w-20", "rounded-t-2xl") }) } as const
