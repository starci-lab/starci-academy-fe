import { cn } from "@heroui/react"

/** Live playground identity, workspace, and settled notice stack. */
export const playgroundSessionClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-6")
/** Compact session identity and relay status header. */
export const playgroundIdentityClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-3", "p-4", "md:flex-row", "md:items-start", "md:gap-8", "md:[&>*:nth-child(2)]:min-w-0", "md:[&>*:nth-child(2)]:grow")
/** Responsive step rail and task split. */
export const playgroundSplitClassName = cn("flex", "w-full", "min-w-0", "flex-col", "items-start", "gap-6", "md:flex-row", "md:gap-8", "md:[&>*:first-child]:w-72", "md:[&>*:first-child]:shrink-0", "md:[&>*:last-child]:min-w-0", "md:[&>*:last-child]:grow")
/** Vertical server-owned step rail. */
export const playgroundStepRailClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-2", "p-4")
/** Selected instruction and submission action stack. */
export const playgroundTaskClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-6", "p-6")
