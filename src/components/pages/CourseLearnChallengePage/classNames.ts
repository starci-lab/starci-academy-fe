import { cn } from "@heroui/react"

/** Challenge shell preserves the workbench before the supporting course map. */
export const challengePageFrameClassName = cn("flex", "w-full", "min-w-0", "items-start")
/** The Challenge keeps one focused workbench; its toolbar opens the course map as a drawer. */
export const challengePageRailClassName = cn("hidden")
/** No persistent rail means no inert resize affordance. */
export const challengePageDividerClassName = cn("hidden")
/** Main grading plane always receives the remaining usable width. */
export const challengePageSurfaceClassName = cn("min-w-0", "flex-1")
