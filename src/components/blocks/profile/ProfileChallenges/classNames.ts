import { cn } from "@heroui/react"

/** Repeating challenge evidence sections. */
export const profileMainClassName = cn("flex", "min-w-0", "grow", "flex-col", "gap-6", "@app-lg:mx-auto", "@app-lg:max-w-5xl")
/** Two-then-four-column challenge proof ribbon. */
export const profileProofMetricsClassName = cn("grid", "grid-cols-2", "gap-3", "p-4", "sm:grid-cols-4")
/** One challenge proof figure and qualifier. */
export const profileProofMetricClassName = cn("flex", "flex-col", "gap-1")
/** Joined passed-submission evidence rows. */
export const profileEvidenceListClassName = cn("flex", "flex-col", "divide-y", "divide-separator", "p-0")
/** Wide evidence slab stays deliberate around compact empty content. */
export const profileEvidenceSurfaceClassName = cn("w-full", "@app-lg:mx-auto", "@app-lg:max-w-4xl")
