import { cn } from "@heroui/react"

/** Gives loading, empty, recovery, and populated history states one deliberate drawer rhythm. */
export const personalProjectHistoryClassName = cn("flex", "min-h-64", "min-w-0", "flex-col", "gap-4")
/** Stacks immutable attempts with enough separation for scanning. */
export const personalProjectHistoryListClassName = cn("flex", "min-w-0", "flex-col", "gap-3")
/** Keeps one attempt action and its immutable metadata together. */
export const personalProjectHistoryRowClassName = cn("flex", "min-w-0", "flex-col", "items-start", "gap-2", "rounded-large", "border", "border-separator", "p-3")
/** Keeps pagination actions adjacent and wrap-safe. */
export const personalProjectHistoryNavClassName = cn("mt-auto", "flex", "flex-wrap", "gap-2")
