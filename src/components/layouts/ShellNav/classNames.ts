import { cn } from "@heroui/react"

/** Desktop primary destinations inside the Grammar-owned navigation slot. */
export const shellNavRoutesClassName = cn("flex", "min-w-0", "items-center", "justify-center", "gap-2")
/** Desktop search and preference controls; compact reaches them through the overflow menu. */
export const shellNavDesktopToolsClassName = cn("hidden", "min-w-0", "items-center", "gap-2", "md:flex")
/** Persistent account/commerce controls share the single compact row. */
export const shellNavActionsClassName = cn("flex", "min-w-0", "items-center", "justify-end", "gap-2")
/** The optional feature layer consumes the full Grammar slot without introducing a separator. */
export const shellNavTabsClassName = cn("w-full", "min-w-0", "shell-nav-feature-tabs")

/** Full-height compact navigation body; DrawerBranch owns the outer frame and close action. */
export const shellNavDrawerContentClassName = cn("flex", "min-h-full", "min-w-0", "flex-col", "gap-6", "px-3", "py-6")
/** Primary destinations keep production's generous vertical rail rhythm inside the drawer. */
export const shellNavDrawerRoutesClassName = cn("flex", "min-w-0", "flex-col", "gap-1", "[&>a]:w-full", "[&>a]:justify-start", "[&>a]:px-3", "[&>a]:py-3")
/** Utilities are a secondary action family, separated once from route navigation. */
export const shellNavDrawerUtilitiesClassName = cn("flex", "min-w-0", "flex-col", "gap-1", "border-t", "border-separator", "pt-4", "[&>button]:w-full", "[&>button]:justify-start")
