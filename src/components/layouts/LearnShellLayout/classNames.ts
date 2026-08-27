import { cn } from "@heroui/react"

/** Main learning frame alignment. */
export const learnShellFrameClassName = cn("flex", "min-h-screen", "w-full", "min-w-0", "flex-col", "items-start", "md:flex-row", "md:items-start")
/** Persistent course navigation rail placement. */
export const learnShellRailClassName = cn("hidden", "h-full", "w-full", "min-w-0", "flex-col", "gap-4", "overflow-hidden", "border-separator", "px-3", "py-6", "md:flex", "md:w-64", "md:shrink-0", "md:border-r", "md:sticky", "md:top-16")
/** Flexible routed body. */
export const learnShellBodyClassName = cn("w-full", "min-w-0", "flex-1")
/** Compact mobile course-location row. */
export const learnShellMobileNavigationClassName = cn("flex", "w-full", "flex-row", "items-center", "justify-between", "gap-3", "border-b", "border-separator", "px-4", "py-3", "md:hidden")
/** Bottom mobile tab navigation. */
export const learnShellMobileBarClassName = cn("sticky", "bottom-0", "z-40", "flex", "w-full", "min-w-0", "flex-row", "items-center", "justify-between", "gap-2", "border-t", "border-separator", "bg-background", "px-4", "py-3", "md:hidden")
