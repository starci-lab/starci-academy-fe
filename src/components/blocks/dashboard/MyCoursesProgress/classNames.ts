import { cn } from "@heroui/react"

/** `course-progress-list` from the contract registry. */
export const courseProgressListClassName = cn("overflow-hidden", "divide-y", "divide-separator", "p-0")

/** One divided row inside the flush progress list: outer edge 16px, divider edge 12px. */
export const courseProgressListRowClassName = cn("px-4", "py-3", "first:pt-4", "last:pb-4")
