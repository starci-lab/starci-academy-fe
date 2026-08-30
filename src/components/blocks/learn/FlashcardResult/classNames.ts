import { cn } from "@heroui/react"

/** Persisted result workspace column. */
export const flashcardResultWorkspaceClassName = cn("mx-auto", "flex", "w-full", "max-w-6xl", "min-w-0", "flex-col", "gap-6", "px-6", "py-6")
/** Summary card stack. */
export const flashcardSummaryClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-6", "p-6")
/** Centred title and supporting copy. */
export const titlePairClassName = cn("flex", "flex-col", "gap-3", "items-center", "text-center")
/** Responsive result-stat grid. */
export const flashcardStatGridClassName = cn("grid", "w-full", "min-w-0", "grid-cols-2", "gap-3", "sm:grid-cols-4")
/** One bordered result statistic. */
export const flashcardStatClassName = cn("flex", "flex-col", "gap-2", "rounded-xl", "border", "border-separator", "p-4")
/** Evidence and sticky next-action split. */
export const flashcardResultBodyClassName = cn("flex", "w-full", "min-w-0", "flex-col", "items-stretch", "gap-6", "md:flex-row", "md:items-start", "md:gap-8")
/** Diagnostic evidence column. */
export const flashcardEvidenceClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-6", "md:grow")
/** Bounded next-action rail prevents an empty full-width card beside evidence. */
export const flashcardNextActionRailClassName = cn("w-full", "md:w-80", "md:shrink-0")
/** Joined fact list. */
export const flashcardFactListClassName = cn("flex", "w-full", "min-w-0", "flex-col", "divide-y", "divide-separator", "overflow-hidden", "p-0")
/** One comparable fact row. */
export const flashcardFactRowClassName = cn("grid", "min-w-0", "grid-cols-[1fr_auto]", "items-baseline", "gap-x-3", "gap-y-2", "rounded-xl", "p-4", "[&_[role=progressbar]]:col-span-2")
/** Continuously reachable next-action panel. */
export const nextActionClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-4", "p-4")
/** Dedicated result recovery owner; never leave the route as a blank canvas. */
export const flashcardResultRecoveryClassName = cn("flex", "min-h-72", "min-w-0", "flex-col", "items-start", "justify-center", "gap-4", "p-6", "sm:p-8")
/** Recovery and next actions wrap safely at constrained widths. */
export const flashcardResultActionClassName = cn("flex", "min-w-0", "flex-wrap", "gap-2")
