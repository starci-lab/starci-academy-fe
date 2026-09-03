import { cn } from "@heroui/react"

/** Contribution grid styles. */
/** Calendar viewport. */
export const contributionViewportClassName = cn(
    "cursor-grab",
    "active:cursor-grabbing",
    "lg:overflow-hidden",
    "max-lg:overflow-x-auto",
    "max-lg:pb-2",
)
/** Calendar grid. */
export const contributionGridClassName = cn("flex", "w-full", "flex-row", "items-stretch", "gap-0.5")
/** Weekday column: dropped below the wide rail so a narrow drag surface keeps its full year visible. */
export const contributionWeekdayColumnClassName = cn("flex", "w-12", "shrink-0", "flex-col", "gap-0.5", "pr-1", "max-lg:hidden")
/** Spacer aligning weekday labels with the month row above the plot. */
export const contributionMonthSpacerClassName = cn("h-4", "shrink-0")
/** Weekday label. */
export const contributionWeekdayClassName = cn("flex", "min-h-0", "flex-1", "items-center", "whitespace-nowrap", "text-xs", "leading-none", "text-muted")
/** Calendar week. */
export const contributionWeekClassName = cn("flex", "min-w-0", "flex-1", "flex-col", "gap-0.5")
/** Month label. */
export const contributionMonthClassName = cn("flex", "h-4", "w-full", "shrink-0", "items-center", "justify-center", "text-xs", "leading-4", "text-muted", "tabular-nums")
/** Full localized month label at widths that can carry it. */
export const contributionMonthWideClassName = cn("sr-only")
/** Numeric month marker keeps the whole year visible on compact surfaces. */
export const contributionMonthCompactClassName = cn("inline")
/** Resolve a calendar cell style. */
export const getContributionCellClassName = (level: number, loading: boolean, inYear: boolean) => {
    const tone = level === 0 ? "bg-default" : level === 1 ? "bg-accent/20" : level === 2 ? "bg-accent/40" : level === 3 ? "bg-accent/60" : "bg-accent"
    return cn("aspect-square", "size-auto", "w-full", "shrink-0", "rounded-sm", loading && inYear ? "animate-pulse" : undefined, loading && inYear ? "bg-default" : undefined, !loading && inYear ? tone : undefined)
}
