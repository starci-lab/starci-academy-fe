import { cn } from "@heroui/react"

/** Identifies the compact state mark in the offset-pop visual layer. */
export const stateMarkClassName = cn("size-5", "shrink-0")
/** Identifies the quiet ordinal prefix used by ordered content. */
export const leadingNumberClassName = cn("shrink-0", "font-mono", "text-sm")
/** Identifies one static state row shell. */
export const staticRowClassName = cn("flex", "items-start", "gap-2", "py-2")
/** Identifies the text grouping inside a static state row. */
export const staticRowCopyClassName = cn("flex", "min-w-0", "flex-col", "gap-1")
