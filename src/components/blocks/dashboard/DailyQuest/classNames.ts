import { cn } from "@heroui/react"
import { dashboardNeutralBandMiddleClassName } from "../classNames"

/** Stack the hero, reward band, and task evidence as one full-bleed card body. */
export const dailyQuestCardClassName = cn("flex", "min-w-0", "flex-col")

/** Keep the decorative reward art on an accent hero slab. */
export const dailyQuestHeroClassName = cn(
    "relative",
    "isolate",
    "min-h-32",
    "overflow-hidden",
    "bg-accent",
    "sm:min-h-36",
)

/** The generated quest illustration stays decorative on the hero's trailing edge. */
export const dailyQuestHeroImageClassName = cn(
    "pointer-events-none",
    "absolute",
    "bottom-0",
    "right-1",
    "z-0",
    "size-28",
    "object-contain",
    "sm:bottom-1",
    "sm:right-3",
    "sm:size-36",
)

/** Separate the three quest bands without inventing extra vertical space. */
export const dailyQuestSeparatorClassName = cn("border-t", "border-separator")

/** Keep an unclaimed promise neutral; only a proven claimed outcome receives success. */
export const dailyQuestRewardBandClassName = (claimed: boolean) => cn(
    "flex",
    "min-w-0",
    "items-center",
    "justify-between",
    "gap-2",
    dashboardNeutralBandMiddleClassName,
    claimed && "bg-success-soft",
)

/** Lay out the five daily facts as one full-height separated evidence band. */
export const dailyQuestTasksClassName = cn(
    "m-0",
    "grid",
    "min-w-0",
    "list-none",
    "grid-cols-1",
    "gap-0",
    "p-0",
    "divide-y",
    "divide-separator",
    "lg:grid-cols-5",
    "lg:divide-y-0",
    "lg:divide-x",
)

/** px-4 always; pb-4 only on the bottom edge; p-3 on separator sides vertically. */
export const dailyQuestTaskCellClassName = cn(
    "flex",
    "min-w-0",
    "h-full",
    "flex-col",
    "gap-0.5",
    "px-4",
    "pt-3",
    "pb-3",
    "last:pb-4",
    "lg:pb-4",
)
