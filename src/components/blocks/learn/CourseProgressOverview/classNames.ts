import { cn } from "@heroui/react"

/** Primary course completion and supporting evidence stack. */
export const courseProgressOverviewClassName = cn("flex", "min-w-0", "flex-col", "gap-4", "p-4")

/** Two-column comparison for continuity and standing. */
export const courseProgressSupportClassName = cn("grid", "grid-cols-2", "gap-4")

/** Baseline-aligned supporting label and fact. */
export const supportFactClassName = cn(
    "flex",
    "flex-row",
    "flex-wrap",
    "items-baseline",
    "justify-between",
    "gap-2",
)
