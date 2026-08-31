import { cn } from "@heroui/react"

/** Main learning frame alignment. */
export const learnShellFrameClassName = cn("flex", "min-h-[calc(100dvh-4rem)]", "w-full", "min-w-0", "flex-col", "items-start", "min-[1120px]:flex-row", "min-[1120px]:items-start")
/** Persistent course navigation rail placement. */
export const getLearnShellRailClassName = (isCollapsed: boolean) => cn("hidden", "h-full", "w-full", "min-w-0", "flex-col", "overflow-hidden", "border-separator", "transition-[width]", "min-[1120px]:flex", isCollapsed ? "min-[1120px]:w-20" : "min-[1120px]:w-64", "min-[1120px]:h-[calc(100dvh-4rem)]", "min-[1120px]:max-h-[calc(100dvh-4rem)]", "min-[1120px]:shrink-0", "min-[1120px]:self-start", "min-[1120px]:border-r", "min-[1120px]:sticky", "min-[1120px]:top-16")
/** Flexible routed body. */
export const learnShellBodyClassName = cn("w-full", "min-w-0", "flex-1")
/** Bottom mobile tab navigation. */
export const learnShellMobileBarClassName = cn("sticky", "bottom-0", "z-40", "flex", "w-full", "min-w-0", "flex-row", "items-center", "justify-between", "gap-2", "border-t", "border-separator", "bg-background", "px-4", "py-3", "min-[1120px]:hidden")
