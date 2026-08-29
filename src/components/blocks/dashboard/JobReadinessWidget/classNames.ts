import { cn } from "@heroui/react"

/** Readiness score and its qualitative band form one responsive headline. */
export const readinessHeadlineClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "gap-2",
    "sm:flex-row",
    "sm:items-center",
    "sm:justify-between",
)

/** Pillars are peer measures, so they share columns instead of nesting another card. */
export const readinessMetricsClassName = cn(
    "grid",
    "min-w-0",
    "gap-4",
    "sm:grid-cols-3",
)
