import { cn } from "@heroui/react"

/** Main learning frame alignment. */
export const learnShellFrameClassName = cn("flex", "min-h-[calc(100dvh-5.875rem)]", "w-full", "min-w-0", "flex-col", "items-start", "lg:min-h-[calc(100dvh-4rem)]", "min-[1120px]:flex-row", "min-[1120px]:items-start")
/** Persistent course navigation rail placement. */
export const learnShellRailClassName = cn("hidden", "h-full", "w-full", "min-w-0", "flex-col", "gap-4", "overflow-hidden", "border-separator", "px-3", "py-6", "min-[1120px]:flex", "min-[1120px]:w-64", "min-[1120px]:shrink-0", "min-[1120px]:border-r", "min-[1120px]:sticky", "min-[1120px]:top-16")
/** Flexible routed body. */
export const learnShellBodyClassName = cn("w-full", "min-w-0", "flex-1")
/** Compact mobile course-location row. */
export const learnShellMobileNavigationClassName = cn("sticky", "top-[5.875rem]", "z-40", "flex", "w-full", "flex-col", "items-stretch", "gap-2", "border-b", "border-separator", "bg-background", "px-4", "py-3", "sm:flex-row", "sm:items-center", "sm:justify-between", "sm:gap-3", "lg:top-16", "min-[1120px]:hidden")
/** Current course name may yield to the navigation action instead of leaving clipped glyphs. */
export const learnShellMobileCurrentClassName = cn("w-full", "min-w-0", "overflow-hidden", "sm:w-auto", "sm:text-right", "[&>*]:truncate")
/** Bottom mobile tab navigation. */
export const learnShellMobileBarClassName = cn("sticky", "bottom-0", "z-40", "flex", "w-full", "min-w-0", "flex-row", "items-center", "justify-between", "gap-2", "border-t", "border-separator", "bg-background", "px-4", "py-3", "min-[1120px]:hidden")
