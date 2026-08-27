import { cn } from "@heroui/react"

/** Sticky visual frame for the global navigation landmark. */
export const shellNavClassName = cn("sticky", "top-0", "z-50", "w-full", "border-b", "border-separator", "bg-background")
/** Primary row that aligns navigation and tools. */
export const shellNavPrimaryClassName = cn("flex", "h-16", "min-h-16", "w-full", "flex-row", "items-center", "justify-between", "gap-3", "px-3")
/** Brand and route group alignment. */
export const shellNavNavigationClassName = cn("flex", "flex-row", "items-center", "gap-6")
/** Desktop route group visibility and spacing. */
export const shellNavRoutesClassName = cn("hidden", "flex-1", "items-center", "justify-center", "gap-2", "md:flex")
/** Action controls alignment. */
export const shellNavToolsClassName = cn("flex", "flex-row", "items-center", "gap-2")
/** Desktop-only search and preference controls. */
export const shellNavDesktopToolsClassName = cn("hidden", "items-center", "gap-2", "md:flex")
/** Optional tab strip width. */
export const shellNavTabsClassName = cn("w-full")
