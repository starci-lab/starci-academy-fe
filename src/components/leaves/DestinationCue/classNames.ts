import { cn, skeletonVariants } from "@heroui/react"

/** One quiet destination label followed by its intrinsic direction. */
export const destinationCueClassName = cn("inline-flex", "w-fit", "shrink-0", "items-center", "gap-1", "text-sm", "font-semibold", "text-accent-soft-foreground")
/** The direction answers hover/focus while the label and row remain still. */
export const destinationCueCaretClassName = cn("shrink-0", "transition-transform", "duration-200", "ease-out", "group-hover:translate-x-1", "group-focus-visible:translate-x-1", "motion-reduce:transition-none", "motion-reduce:group-hover:translate-x-0", "motion-reduce:group-focus-visible:translate-x-0")
/** Preserve a compact action measure while its owning row rests. */
export const destinationCueLoadingClassName = skeletonVariants({ animationType: "shimmer" }).base({ className: cn("inline-flex", "w-16", "shrink-0", "select-none", "text-sm", "text-transparent") })
