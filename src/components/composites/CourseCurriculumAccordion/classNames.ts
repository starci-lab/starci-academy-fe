import { cn } from "@heroui/react"

/** `course-curriculum-accordion` from the contract registry. */
export const curriculumClassName = cn("flex", "min-w-0", "flex-col", "gap-3")
/** `curriculum-module-summary-row` from the contract registry. */
export const curriculumSummaryClassName = cn(
    "grid",
    "w-full",
    "min-w-0",
    "grid-cols-[1fr_auto]",
    "items-start",
    "gap-x-3",
    "gap-y-1",
    "[&>*:first-child]:col-start-1",
    "[&>*:first-child]:row-start-1",
    "[&>*:first-child]:min-w-0",
    "[&>*:nth-child(2)]:col-start-1",
    "[&>*:nth-child(2)]:row-start-2",
    "[&>*:last-child]:col-start-2",
    "[&>*:last-child]:row-span-2",
    "[&>*:last-child]:row-start-1",
    "[&>*:last-child]:self-center",
    "[&>*:last-child]:shrink-0",
    "sm:flex",
    "sm:items-center",
    "sm:gap-3",
    "sm:[&>*:first-child]:grow",
)
/** `curriculum-module-meta-row` from the contract registry. */
export const curriculumMetaClassName = cn("flex", "shrink-0", "flex-row", "flex-wrap", "items-center", "gap-2")
/** `course-curriculum-module-body` from the contract registry. */
export const curriculumBodyClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-3")
