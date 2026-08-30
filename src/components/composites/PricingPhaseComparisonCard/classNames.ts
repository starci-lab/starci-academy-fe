import { cn } from "@heroui/react"

/** Express ordered phase progression without compressing it into a mini table. */
export const pricingPhaseListClassName = cn(
    "relative", "flex", "min-w-0", "flex-col", "gap-3",
    "before:absolute", "before:bottom-2", "before:left-1", "before:top-2", "before:w-px", "before:bg-separator",
)

/** Stack each phase value under its identity so comparison remains readable in a narrow rail. */
export const pricingPhaseRowClassName = cn(
    "relative", "grid", "min-w-0", "grid-cols-[auto_1fr]", "gap-x-3", "gap-y-1",
    "[&>*:nth-child(2)]:col-start-2", "[&>*:nth-child(2)]:min-w-0",
    "[&>*:last-child]:col-start-2", "[&>*:last-child]:min-w-0",
)

/** Mark order neutrally and reserve accent for the current phase. */
export const getPricingPhaseMarkerClassName = (isActive: boolean) => cn(
    "relative", "z-10", "col-start-1", "row-start-1", "mt-1.5", "size-2", "shrink-0", "rounded-full", "ring-4", "ring-surface",
    isActive ? "bg-accent" : "bg-muted",
)
