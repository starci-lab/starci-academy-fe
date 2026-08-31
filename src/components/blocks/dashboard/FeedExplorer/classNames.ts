import { cn } from "@heroui/react"

/** Keep the dual feed controls inside the viewport instead of creating a hidden horizontal trap. */
export const feedExplorerToolbarViewportClassName = cn("w-full", "min-w-0", "overflow-visible")

/** Stack the two axes when compact widths need room for every selected target. */
export const feedExplorerToolbarClassName = cn(
    "grid",
    "w-full",
    "min-w-0",
    "gap-3",
    "rounded-2xl",
    "border",
    "border-separator",
    "bg-surface/75",
    "p-3",
    "md:grid-cols-2",
)

/** Bind one visible axis label to one independently selected ChoiceTabs group. */
export const feedExplorerAxisClassName = cn("flex", "min-w-0", "flex-col", "items-start", "gap-2")

/** Stack the Explore feed surfaces without allowing them to collapse horizontally. */
export const feedExplorerStackClassName = cn("flex", "min-w-0", "flex-col", "gap-6")
