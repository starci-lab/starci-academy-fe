import { cn } from "@heroui/react"

/** `course-detail-page` from the contract registry. */
export const courseDetailPageClassName = cn("flex", "min-w-0", "flex-col")
/** Keep a terminal request state inside the same measure as settled content. */
export const courseDetailStateClassName = cn("mx-auto", "w-full", "max-w-6xl", "px-6", "py-6")
/** `course-section-navigation` from the contract registry. */
export const courseDetailNavigationClassName = cn(
    "sticky",
    "top-16",
    "z-50",
    "-mt-px",
    "flex",
    "w-full",
    "min-w-0",
    "overflow-x-hidden",
    "border-b",
    "border-separator",
    "bg-background",
    "px-6",
    "[&>*]:w-full",
    "sm:[&>*]:w-auto",
    "[&>*]:min-w-0",
)
/** Give the title one strong, bounded reading measure. */
export const courseDetailHeroClassName = cn("flex", "min-w-0", "grow", "scroll-mt-28", "flex-col", "gap-2")
/** Present trust signals as one ribbon rather than loose paragraphs. */
export const courseDetailStatsClassName = cn("grid", "grid-cols-2", "overflow-hidden", "[&>*]:p-3", "[&>*:nth-child(odd)]:border-r", "[&>*:nth-child(-n+4)]:border-b", "[&>*]:border-separator")
/** Each statistic owns one consistent cell in the ribbon. */
export const courseDetailStatClassName = cn("flex", "min-w-0", "flex-col", "gap-2")
/** Keep learning evidence primary and the commercial decision in a bounded rail. */
export const courseDetailBodyClassName = cn("mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "px-6", "pb-6", "pt-6", "lg:flex-row", "lg:items-start", "lg:gap-8", "lg:pt-0", "lg:[&>*:first-child]:min-w-0", "lg:[&>*:first-child]:grow", "lg:[&>*:last-child]:w-80", "lg:[&>*:last-child]:shrink-0", "lg:[&>*:last-child]:sticky", "lg:[&>*:last-child]:top-course-rail", "lg:[&>*:last-child]:self-start")
/** Preserve the authored course reading order in one column. */
export const courseDetailContentClassName = cn("flex", "min-w-0", "flex-col", "gap-6", "lg:pt-6")
/** Pair the promise and prerequisite evidence when there is room. */
export const courseDetailOverviewClassName = cn("contents")
/** Give each authored section a visible heading/content rhythm. */
export const courseDetailSectionClassName = cn("flex", "min-w-0", "flex-col", "gap-3", "scroll-mt-28")
/** Keep the purchase decision reachable on wide screens. */
export const courseDetailRailClassName = cn("min-w-0", "lg:pt-6")
