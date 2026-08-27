import { cn } from "@heroui/react"

/** Identifies the outer labelled surface-card anatomy. */
export const surfaceCardClassName = cn("flex", "min-w-0", "flex-col")
/** Identifies the external label row of a surface card. */
export const surfaceLabelClassName = cn("flex", "items-center", "justify-between", "gap-2")
/** Identifies the bounded surface content shell. */
export const surfaceClassName = cn("min-w-0", "overflow-hidden")
/** Identifies frameless surface content. */
export const framelessSurfaceClassName = cn("min-w-0", "overflow-hidden")
/** Identifies the content region inside a surface. */
export const surfaceContentClassName = cn("min-w-0")

/** Selects the bounded or frameless surface treatment without changing anatomy. */
export const getSurfaceFrameClassName = (frame: "bounded" | "frameless") => cn(
    "min-w-0", "overflow-hidden", frame === "frameless" ? "border-0" : undefined,
    frame === "frameless" ? "shadow-none" : undefined,
)
