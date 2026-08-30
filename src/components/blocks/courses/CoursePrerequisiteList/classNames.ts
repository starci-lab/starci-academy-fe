import { cn } from "@heroui/react"

/** `course-prerequisite-list` from the contract registry. */
export const prerequisiteListClassName = cn("flex", "flex-col", "divide-y", "divide-separator", "overflow-hidden", "p-0", "[&>*]:px-4", "[&>*]:py-3")
/** `course-prerequisite-row` from the contract registry. */
export const prerequisiteRowClassName = cn("flex", "flex-row", "items-start", "gap-3", "[&>*:last-child]:min-w-0", "[&>*:last-child]:grow")
