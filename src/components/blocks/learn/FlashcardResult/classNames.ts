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
/** Joined fact list. */
export const flashcardFactListClassName = cn("flex", "w-full", "min-w-0", "flex-col", "divide-y", "divide-separator", "overflow-hidden", "p-0")
/** One comparable fact row. */
export const flashcardFactRowClassName = cn("flex", "flex-row", "flex-wrap", "items-baseline", "justify-between", "gap-2", "rounded-xl", "p-4")
/** Continuously reachable next-action panel. */
export const nextActionClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-4", "p-4", "md:w-80", "md:shrink-0")
