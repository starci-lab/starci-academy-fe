import { cn } from "@heroui/react"
import { pressableLabelClassName } from "@/components/branches/PressableSurface/classNames"

/** Keep artwork and commerce facts in one dense, scan-friendly row at every width. */
export const recommendedCourseRowClassName = cn("grid", "min-w-0", "grid-cols-[3rem_1fr]", "items-start", "gap-3")

/** Separate the evidence bundle from the destination cue. */
export const recommendedCourseBodyClassName = cn("flex", "min-w-0", "flex-col", "gap-3")

/** Stack recommendation evidence at the compact fact rhythm. */
export const recommendedCourseEvidenceClassName = cn(pressableLabelClassName, "flex", "min-w-0", "flex-col", "gap-2")

/** Keep current, superseded, and discount facts together as one price hierarchy. */
export const recommendedCoursePriceClassName = cn("flex", "min-w-0", "flex-wrap", "items-baseline", "gap-x-2", "gap-y-1")

/** Stack the row's destination and the price question it must not swallow. */
export const recommendedCourseShellClassName = cn("flex", "min-w-0", "flex-col", "gap-2")

/**
 * Pair the saving with its explanation affordance on one readable line.
 *
 * The line sits OUTSIDE the row's press target - a control inside a control is invalid HTML, and
 * the press bubbled to the row, so asking about the price also opened the course. It keeps the
 * body column's alignment by clearing the mark's 3rem tile and the 0.75rem gutter beside it.
 */
export const recommendedCourseDetailsClassName = cn("flex", "min-w-0", "flex-wrap", "items-baseline", "gap-x-2", "gap-y-1", "pl-[3.75rem]")
/** The cover fills the tile it is dropped into, cropping rather than letterboxing. */
export const recommendedCourseCoverClassName = cn("size-full", "object-cover")
