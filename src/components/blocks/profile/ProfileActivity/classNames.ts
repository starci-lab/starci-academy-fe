import { cn } from "@heroui/react"

/** Repeating activity evidence sections. */
export const profileMainClassName = cn("flex", "min-w-0", "grow", "flex-col", "gap-6")
/** The page promise stays compact before evidence begins. */
export const profileActivityHeadingClassName = cn("flex", "min-w-0", "flex-col", "gap-1")
/** Timeline is primary; achievement proof forms a restrained rail when wide. */
export const profileActivityEvidenceGridClassName = `${cn("grid", "min-w-0", "grid-cols-1", "gap-6", "items-start")} @app-lg:grid-cols-[minmax(0,2fr)_minmax(17rem,1fr)]`
/** Three direct facts explain density without becoming a dashboard. */
export const profileActivityFactGridClassName = cn("grid", "min-w-0", "grid-cols-2", "divide-x", "divide-separator")
/** Each summary fact remains a typographic unit on shared ground. */
export const profileActivityFactClassName = cn("flex", "min-w-0", "flex-col", "gap-1", "px-3", "first:ps-0", "last:pe-0")
/** Achievement cards that stack before gaining columns. */
export const profileAchievementGridClassName = cn("grid", "grid-cols-1", "gap-3")
/** Grouped activity result column. */
export const activityFeedResultClassName = cn("flex", "w-full", "flex-col", "gap-2")
