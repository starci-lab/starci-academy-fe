import { cn } from "@heroui/react"

/** Keep artwork and commerce facts in one dense, scan-friendly row at every width. */
export const recommendedCourseRowClassName = cn("grid", "min-w-0", "grid-cols-[3rem_1fr]", "items-start", "gap-3")

/** Stack the recommendation's facts without turning captions into empty vertical bands. */
export const recommendedCourseBodyClassName = cn("flex", "min-w-0", "flex-col", "gap-1")

/** Keep current, superseded, and discount facts together as one price hierarchy. */
export const recommendedCoursePriceClassName = cn("flex", "min-w-0", "flex-wrap", "items-baseline", "gap-x-2", "gap-y-1")

/** Pair the saving with its explanation affordance on one readable line. */
export const recommendedCourseDetailsClassName = cn("flex", "min-w-0", "flex-wrap", "items-baseline", "gap-x-2", "gap-y-1")
