import { cn } from "@heroui/react"

/** Evidence identity beside its short trailing fact and disclosure. */
export const evidenceRowClassName = cn("flex", "w-full", "flex-row", "items-center", "justify-between", "gap-4", "p-4", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow")
/** Evidence title attached to its qualifying subtitle. */
export const evidenceIdentityClassName = cn("flex", "min-w-0", "flex-col", "gap-1")
