import { cn } from "@heroui/react"

/** Contribution grid styles. */
/** Calendar viewport. */
export const contributionViewportClassName = cn("cursor-grab", "overflow-hidden", "active:cursor-grabbing")
/** Calendar grid. */
export const contributionGridClassName = cn("flex", "w-max", "flex-row", "items-start", "gap-1")
/** Weekday column. */
export const contributionWeekdayColumnClassName = cn("flex", "w-8", "shrink-0", "flex-col", "gap-1", "pt-5", "pr-1")
/** Weekday label. */
export const contributionWeekdayClassName = cn("h-3", "text-xs", "leading-3", "text-muted")
/** Calendar week. */
export const contributionWeekClassName = cn("flex", "shrink-0", "flex-col", "gap-1")
/** Month label. */
export const contributionMonthClassName = cn("h-4", "w-3", "whitespace-nowrap", "text-xs", "text-muted")
/** Resolve a calendar cell style. */
export const getContributionCellClassName = (level: number, loading: boolean, inYear: boolean) => {
    const tone = level === 0 ? "bg-default" : level === 1 ? "bg-accent/20" : level === 2 ? "bg-accent/40" : level === 3 ? "bg-accent/60" : "bg-accent"
    return cn("size-3", "shrink-0", loading && inYear ? "animate-pulse" : undefined, loading && inYear ? "bg-default" : undefined, !loading && inYear ? tone : undefined)
}
