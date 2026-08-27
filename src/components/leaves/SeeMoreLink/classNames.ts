import { cn, skeletonVariants } from "@heroui/react"

/** See-more link layout. */
export const seeMoreLinkClassName = cn("group", "inline-flex", "w-fit", "shrink-0", "cursor-pointer", "items-center", "gap-1", "text-sm", "font-semibold", "text-accent-soft-foreground", "no-underline")
/** Caret hover motion. */
export const seeMoreCaretClassName = cn("shrink-0", "transition-[translate]", "group-hover:translate-x-1")
/** Loading placeholder. */
export const seeMoreLoadingClassName = skeletonVariants({ animationType: "shimmer" }).base({ className: cn("inline-flex", "w-16", "shrink-0", "select-none", "text-sm", "text-transparent") })
