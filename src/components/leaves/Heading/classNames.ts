import { cn, skeletonVariants } from "@heroui/react"

/** Heading level styles. */
export const headingLevelClassNames = { 1: cn("text-xl", "font-semibold", "tracking-tight"), 2: cn("text-base", "font-semibold"), 3: cn("text-sm", "font-medium"), 4: cn("text-xs", "font-medium", "text-muted") } as const
/** Heading loading styles. */
export const getHeadingClassName = (level: 1 | 2 | 3 | 4, loading: boolean) => cn(headingLevelClassNames[level], loading ? skeletonVariants({ animationType: "shimmer" }).base({ className: cn("select-none", "text-transparent") }) : undefined)
