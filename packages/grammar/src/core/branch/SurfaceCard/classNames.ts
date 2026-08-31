import { cn } from "@heroui/react"

/** Identifies the outer labelled surface-card anatomy. */
export const surfaceCardClassName = cn("starci-core-surface-card", "flex", "min-w-0", "flex-col")
/** Identifies the external label row of a surface card. */
export const surfaceLabelClassName = cn("starci-core-surface-label")
/** Identifies the bounded surface content shell. */
export const surfaceClassName = cn("starci-core-surface", "min-w-0", "overflow-hidden")
/** Frameless surfaces let nested bounded cards own clipping; Core CSS sets overflow: visible. */
export const framelessSurfaceClassName = cn("starci-core-surface", "starci-core-frameless-surface", "min-w-0", "overflow-visible")
/** Identifies the content region inside a surface. */
export const surfaceContentClassName = cn("starci-core-surface-content", "min-w-0")
/** Anchor the singular legacy continuation highlight at the surface boundary. */
export const surfaceHighlightClassName = cn("starci-core-surface-highlight", "relative", "h-full")
/** Decorative sweep layer painted behind the highlighted surface. */
export const surfaceHighlightSweepClassName = cn("starci-core-surface-highlight-sweep")

/** Selects the bounded or frameless surface treatment without changing anatomy. */
export const getSurfaceFrameClassName = (frame: "bounded" | "frameless") => cn(
    frame === "frameless" ? framelessSurfaceClassName : surfaceClassName,
    frame === "frameless" ? "border-0" : undefined,
    frame === "frameless" ? "shadow-none" : undefined,
)
