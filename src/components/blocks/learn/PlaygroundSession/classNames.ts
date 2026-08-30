import { cn } from "@heroui/react"

/** Live playground identity, workspace, and settled notice stack. */
export const playgroundSessionClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-6")
/** Compact session identity and relay status header. */
export const playgroundIdentityClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-3", "p-4", "md:flex-row", "md:items-start", "md:gap-8", "md:[&>*:nth-child(2)]:min-w-0", "md:[&>*:nth-child(2)]:grow")
/** Responsive step rail and task split. */
export const playgroundSplitClassName = cn("grid", "w-full", "min-w-0", "grid-cols-1", "items-start", "gap-6", "xl:grid-cols-12", "xl:[&>*:nth-child(1)]:col-span-2", "xl:[&>*:nth-child(2)]:col-span-6", "xl:[&>*:nth-child(3)]:col-span-4", "xl:[&>*:nth-child(4)]:col-span-10", "xl:[&>*:nth-child(4)]:col-start-3")
/** Vertical server-owned step rail. */
export const playgroundStepRailClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-2", "p-4")
/** Selected instruction and submission action stack. */
export const playgroundTaskClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-6", "p-6")
/** Local command scratchpad and truthful server-activity column. */
export const playgroundWorkbenchClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-5", "p-5", "sm:p-6")
/** Keep the primary verification action clear when it is scrolled into a viewport edge. */
export const playgroundVerifyActionClassName = cn("scroll-mt-24", "scroll-mb-8")
/** Bound the event stream while keeping recent verification activity readable. */
export const playgroundActivityClassName = cn("flex", "max-h-[28rem]", "min-h-64", "w-full", "min-w-0", "flex-col", "gap-4", "overflow-auto", "p-5", "sm:p-6")
/** Pair one server-owned activity label with its status. */
export const playgroundActivityRowClassName = cn("flex", "items-start", "justify-between", "gap-4", "border-b", "border-divider", "pb-3", "last:border-b-0", "last:pb-0")
