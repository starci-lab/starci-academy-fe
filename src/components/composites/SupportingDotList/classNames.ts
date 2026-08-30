import { cn } from "@heroui/react"

/** Keep supporting statements in one readable vertical collection. */
export const supportingDotListClassName = cn("flex", "min-w-0", "flex-col", "gap-2")
/** Bind each marker to its statement instead of letting the two texts stack. */
export const supportingDotListRowClassName = cn("grid", "min-w-0", "grid-cols-[auto_1fr]", "items-start", "gap-2")
