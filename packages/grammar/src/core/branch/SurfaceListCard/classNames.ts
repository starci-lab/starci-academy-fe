import { cn } from "@heroui/react"

/** Identifies the outer surface-list anatomy. */
export const surfaceListClassName = cn("flex", "min-w-0", "flex-col")
/** Identifies the external label row shared by surface branches. */
export const surfaceLabelClassName = cn("flex", "items-center", "justify-between", "gap-2")
/** Identifies the list's bounded surface shell. */
export const listShellClassName = cn("min-w-0", "overflow-hidden")
/** Identifies the optional footer region. */
export const surfaceFooterClassName = cn("flex", "items-center")
/** Selects the collection treatment for verdict and ordinary lists. */
export const getCollectionClassName = (isVerdict: boolean) => cn("w-full", isVerdict ? "rounded-none" : undefined)
