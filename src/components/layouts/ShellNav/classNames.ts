import { cn } from "@heroui/react"

/** Sticky visual frame for the global navigation landmark. */
export const shellNavClassName = cn("sticky", "top-0", "z-50", "w-full", "border-b", "border-separator", "bg-background")
/** Primary row that aligns navigation and tools. */
export const shellNavPrimaryClassName = cn("flex", "min-h-16", "w-full", "flex-wrap", "items-center", "justify-between", "gap-x-3", "px-3", "lg:h-16", "lg:flex-nowrap")
/** Brand and route group alignment. */
export const shellNavNavigationClassName = cn("order-1", "flex", "min-w-0", "flex-1", "flex-row", "items-center", "gap-6")
/** Desktop route group visibility and spacing. */
export const shellNavRoutesClassName = cn("order-3", "flex", "w-full", "min-w-0", "items-center", "justify-center", "gap-2", "border-t", "border-separator", "py-2", "lg:order-2", "lg:w-auto", "lg:border-t-0", "lg:py-0")
/** Action controls alignment. */
export const shellNavToolsClassName = cn("order-2", "flex", "flex-row", "items-center", "justify-end", "gap-2", "lg:order-3", "lg:flex-1")
/** Desktop-only search and preference controls. */
export const shellNavDesktopToolsClassName = cn("hidden", "min-w-0", "items-center", "gap-2", "lg:flex")
/** Compact disclosure preserves search, locale and theme reachability without crowding the bar. */
export const shellNavCompactToolsClassName = cn("flex", "items-center", "lg:hidden")
/** Optional tab strip width. */
export const shellNavTabsClassName = cn("w-full")
