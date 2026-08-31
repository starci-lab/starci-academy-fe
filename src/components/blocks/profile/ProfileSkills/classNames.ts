import { cn } from "@heroui/react"

/** Repeating skill evidence sections. */
export const profileMainClassName = cn("flex", "min-w-0", "grow", "flex-col", "gap-6", "@app-lg:mx-auto", "@app-lg:max-w-5xl")
/** Two-then-four-column coding metric ribbon. */
export const profileMetricRibbonClassName = cn("grid", "grid-cols-2", "gap-3", "p-4", "sm:grid-cols-4")
/** Stack of independent coding breakdowns. */
export const profileBreakdownStackClassName = cn("flex", "flex-col", "gap-4", "p-4")
/** One labelled coding breakdown. */
export const profileBreakdownClassName = cn("flex", "flex-col", "gap-3")
/** Joined proportional distribution run. */
export const profileSegmentRunClassName = cn("flex", "flex-row", "overflow-hidden", "rounded-xl")
/** Wrapping run of topic chips. */
export const profileTopicChipRunClassName = cn("flex", "flex-row", "flex-wrap", "gap-2")
/** Search and filter controls attached to their result list. */
export const profileToolbarOverListClassName = cn("flex", "flex-col", "gap-3", "p-4")
/** Search control beside its short filter action. */
export const profileSearchFilterRowClassName = cn("flex", "flex-row", "items-center", "justify-between", "gap-3")
/** Joined solve-history evidence rows. */
export const profileEvidenceListClassName = cn("flex", "flex-col", "divide-y", "divide-separator", "p-0")
/** Wide evidence slab stays deliberate around compact empty content. */
export const profileEvidenceSurfaceClassName = cn("w-full", "@app-lg:mx-auto", "@app-lg:max-w-4xl")
