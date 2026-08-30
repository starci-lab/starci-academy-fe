import { cn } from "@heroui/react"
import { formCompactSurfaceClassName, formScrollViewportClassName, formSurfaceClassName } from "@starci/grammar/core"
/** Outer section grouping for a reusable surface. */
export const surfaceCardClassName = cn("flex", "w-full", "max-w-full", "min-w-0", "flex-col", "gap-3")
/** Select an optional Grammar-owned surface measure. */
export const getSurfaceCardClassName = (measure: "form" | "formCompact" | undefined) => cn(
    surfaceCardClassName,
    (measure === "form" || measure === "formCompact") && formSurfaceClassName,
    measure === "formCompact" && formCompactSurfaceClassName,
)
/** Label row alignment above a surface. */
export const surfaceLabelClassName = cn("flex", "items-center", "justify-between", "gap-3")
/** Surface frame with no vendor padding; important wins over HeroUI's component-layer inset. */
export const surfaceClassName = cn("w-full", "max-w-full", "min-w-0", "p-0!")
/** Surface content with no vendor padding. */
export const surfaceContentClassName = cn("max-w-full", "min-w-0", "p-0")
/** The compact surface inset used by forms. */
export const surfaceCompactContentClassName = cn("max-w-full", "min-w-0", "p-4")
/** HeroUI's direct Card child: one compact inset and one vertical scroll owner. */
export const surfaceScrollableContentClassName = cn(formScrollViewportClassName, surfaceCompactContentClassName)
/** Select the content inset without rebuilding class decisions in the component. */
export const getSurfaceContentClassName = (inset: "none" | "compact" | undefined) => inset === "compact"
    ? surfaceCompactContentClassName
    : surfaceContentClassName
