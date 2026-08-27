import { cn } from "@heroui/react"

/** Whole personal-project dashboard stack. */
export const coursePersonalProjectClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-6")
/** Breadcrumb and project title stack. */
export const projectHeaderClassName = cn("flex", "flex-col", "gap-3")
/** Next-task card content stack. */
export const projectNextTaskClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-3", "p-6")
/** Whole-project completion stack. */
export const projectCompletionClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-3")
/** Current milestone stack. */
export const projectMilestoneClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-3")
/** Responsive task-card grid. */
export const projectTaskGridClassName = cn("grid", "w-full", "min-w-0", "grid-cols-1", "gap-4", "sm:grid-cols-2")
/** One task card content stack. */
export const projectTaskCardClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-3", "p-4")
/** Ordinal and task title row. */
export const projectTaskHeadingClassName = cn("flex", "w-full", "min-w-0", "items-start", "gap-3")
