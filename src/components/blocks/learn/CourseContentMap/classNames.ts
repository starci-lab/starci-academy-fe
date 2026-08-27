import { cn } from "@heroui/react"

/** Full-height course-map navigation panel. */
export const contentMapPanelClassName = cn("flex", "h-full", "w-full", "min-w-0", "min-h-0", "flex-col", "gap-4", "overflow-hidden", "px-3", "py-6")
/** Independently scrolling module list. */
export const contentMapModuleListClassName = cn("flex", "w-full", "min-w-0", "min-h-0", "flex-1", "flex-col", "divide-y", "divide-separator", "overflow-y-auto", "overscroll-contain")
/** Module summary row. */
export const contentMapModuleSummaryClassName = cn("flex", "w-full", "min-w-0", "flex-row", "items-center", "gap-3", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow", "[&>*:last-child]:shrink-0")
/** Module title and completion evidence stack. */
export const contentMapModuleSummaryCopyClassName = cn("flex", "w-full", "min-w-0", "flex-col", "items-start", "gap-2", "text-left")
/** Width boundary for a module's lesson selector. */
export const contentMapModuleBodyClassName = cn("w-full", "min-w-0")
