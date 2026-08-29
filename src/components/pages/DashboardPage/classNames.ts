import { cn } from "@heroui/react"

/** Place identity beside the selected dashboard panel on wide surfaces. */
export const dashboardLayoutClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-6", "lg:flex-row", "lg:items-start", "lg:gap-8")

/** Keep standing and quick actions in the fixed-width dashboard rail. */
export const dashboardAsideClassName = cn("flex", "w-full", "min-w-0", "shrink-0", "flex-col", "gap-6", "lg:w-72")

/** Let the selected dashboard panel consume the remaining width. */
export const dashboardPanelClassName = cn("flex", "min-w-0", "flex-1", "flex-col", "gap-6")
