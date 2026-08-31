import { cn } from "@heroui/react"

/** Repeating project evidence sections. */
export const profileMainClassName = `${cn("grid", "min-w-0", "grow", "grid-cols-1", "gap-6", "items-start")} @app-lg:grid-cols-[minmax(0,2fr)_minmax(17rem,1fr)]`
/** Equal pinned-project tiles that stack when narrow. */
export const profileProjectCardGridClassName = cn("grid", "grid-cols-1", "gap-4", "@app-sm:grid-cols-2")
/** Empty and recovery states occupy the full project grid measure. */
export const profileProjectEmptyClassName = cn("col-span-full")
/** Joined capstone evidence rows. */
export const profileCapstoneListClassName = cn("flex", "flex-col", "divide-y", "divide-separator", "p-0")
/** A capstone reads as progress evidence, not a flat status row. */
export const profileCapstoneBodyClassName = cn("flex", "min-w-0", "flex-col", "gap-3", "p-4")
/** Course identity and completion fact occupy the first scan line. */
export const profileCapstoneHeaderClassName = cn("flex", "min-w-0", "items-baseline", "justify-between", "gap-3", "[&>*:first-child]:min-w-0")
/** Milestone and task evidence wraps without fragmenting the progress story. */
export const profileCapstoneMetaClassName = cn("flex", "flex-wrap", "items-center", "gap-x-4", "gap-y-1")
