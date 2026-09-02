import { cn } from "@heroui/react"
import {
    formCompactSurfaceClassName,
    formScrollViewportClassName,
    formSurfaceClassName,
} from "../../classNames.js"

export type SurfaceCardMeasure = "content" | "form" | "formCompact"
export type SurfaceCardHeight = "auto" | "fill"

/** Identifies the outer labelled surface-card anatomy. */
export const surfaceCardClassName = cn("starci-core-surface-card", "flex", "min-w-0", "flex-col")
/** Selects an owned measure and height contract without exposing structural class hooks to consumers. */
export const getSurfaceCardClassName = (measure: SurfaceCardMeasure, height: SurfaceCardHeight) => cn(
    surfaceCardClassName,
    measure === "form" || measure === "formCompact" ? formSurfaceClassName : undefined,
    measure === "formCompact" ? formCompactSurfaceClassName : undefined,
    height === "fill" ? "starci-core-surface-card--fill" : undefined,
)
/** Identifies the external label row of a surface card. */
export const surfaceLabelClassName = cn("starci-core-surface-label", "p-0")
/** Identifies the bounded surface content shell. */
export const surfaceClassName = cn("starci-core-surface", "min-w-0", "overflow-hidden", "p-0")
/** Frameless surfaces let nested bounded cards own clipping; Core CSS sets overflow: visible. */
export const framelessSurfaceClassName = cn("starci-core-surface", "starci-core-frameless-surface", "min-w-0", "overflow-visible", "p-0")
/** Identifies the content region inside a surface. */
export const surfaceContentClassName = cn("starci-core-surface-content", "min-w-0")
/** Binds the form-scroll measure to the Grammar-owned scroll viewport only when it exists. */
export const getSurfaceContentClassName = (measure: SurfaceCardMeasure, contained: boolean) => cn(
    surfaceContentClassName,
    contained && (measure === "form" || measure === "formCompact") ? formScrollViewportClassName : undefined,
)
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
