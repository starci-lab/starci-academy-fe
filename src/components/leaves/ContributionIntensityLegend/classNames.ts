import { cn } from "@heroui/react"

/** Legend row layout. */
export const contributionLegendClassName = cn("flex", "flex-row", "items-center", "gap-2")
/** Legend label styling. */
export const contributionLegendLabelClassName = cn("text-xs", "text-muted")
/** Legend loading label. */
export const contributionLegendLoadingLabelClassName = cn("h-3", "w-6", "animate-pulse", "rounded", "bg-default")
/** Legend loading cell. */
export const contributionLegendLoadingCellClassName = cn("size-3", "animate-pulse", "rounded-sm", "bg-default")
/** Lowest contribution intensity cell. */
export const contributionLegendLevelZeroClassName = cn("size-3", "rounded-sm", "bg-default")
/** Low contribution intensity cell. */
export const contributionLegendLevelOneClassName = cn("size-3", "rounded-sm", "bg-accent/20")
/** Medium contribution intensity cell. */
export const contributionLegendLevelTwoClassName = cn("size-3", "rounded-sm", "bg-accent/40")
/** High contribution intensity cell. */
export const contributionLegendLevelThreeClassName = cn("size-3", "rounded-sm", "bg-accent/60")
/** Highest contribution intensity cell. */
export const contributionLegendLevelFourClassName = cn("size-3", "rounded-sm", "bg-accent")

/** Resolve the utility class for one fixed contribution intensity. */
export const getContributionLegendCellClassName = (level: number) => {
    if (level === 0) return contributionLegendLevelZeroClassName
    if (level === 1) return contributionLegendLevelOneClassName
    if (level === 2) return contributionLegendLevelTwoClassName
    if (level === 3) return contributionLegendLevelThreeClassName
    return contributionLegendLevelFourClassName
}
