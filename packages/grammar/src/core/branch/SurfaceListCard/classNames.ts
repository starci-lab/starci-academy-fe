import { cn } from "@heroui/react"

/** Identifies the outer surface-list anatomy. */
export const surfaceListClassName = cn("starci-core-surface-list", "flex", "min-w-0", "flex-col")
/** Identifies the external label row shared by surface branches. */
export const surfaceLabelClassName = cn(
    "starci-core-surface-label",
)
/** Keeps the peer fact at the same visual level as its owning label. */
export const getSurfaceFactClassName = (depth: "top" | "nested") => cn(
    "text-muted",
    depth === "nested" ? "text-xs leading-4" : "text-sm leading-5",
)
/** Identifies the list's bounded surface shell. */
export const listShellClassName = cn("starci-core-surface", "starci-core-list-shell", "min-w-0", "overflow-hidden")
/** Identifies the optional footer region. */
export const surfaceFooterClassName = cn("starci-core-surface-footer", "flex", "items-center")
/** Selects the collection treatment for verdict and ordinary lists. */
export const getCollectionClassName = (isVerdict: boolean) => cn("starci-core-owned-collection", "w-full", isVerdict ? "rounded-none" : undefined)
