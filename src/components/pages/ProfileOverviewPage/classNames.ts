import { cn } from "@heroui/react"

/** Main evidence and supporting readiness become two lanes only when both remain readable. */
export const profileOverviewGridClassName = `${cn(
    "grid",
    "w-full",
    "min-w-0",
    "grid-cols-1",
    "gap-6",
    "@app-lg:items-start",
)} @app-lg:grid-cols-[minmax(0,1fr)_20rem]`
/** Product evidence keeps the primary reading order on every viewport. */
export const profileOverviewMainClassName = cn("flex", "min-w-0", "flex-col", "gap-6")
/** Readiness is supporting evidence on wide screens and the final block on narrow screens. */
export const profileOverviewSupportingClassName = cn("min-w-0")
/** Peer skill snapshots that stack while narrow. */
export const profileOverviewSkillGridClassName = cn("grid", "min-w-0", "max-w-full", "grid-cols-1", "gap-4", "@app-sm:grid-cols-2")
