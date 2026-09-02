import { cn } from "@heroui/react"

/** Desktop primary destinations inside the Grammar-owned navigation slot. */
export const shellNavRoutesClassName = cn("flex", "min-w-0", "items-center", "justify-center", "gap-2")
/** Desktop search and preference controls; compact reaches them through the overflow menu. */
export const shellNavDesktopToolsClassName = cn("hidden", "min-w-0", "items-center", "gap-2", "md:flex")
/** Persistent account/commerce controls share the single compact row. */
export const shellNavActionsClassName = cn("flex", "min-w-0", "items-center", "justify-end", "gap-2")
/** The optional feature layer consumes the full Grammar slot without introducing a separator. */
export const shellNavTabsClassName = cn("w-full", "min-w-0", "shell-nav-feature-tabs")
/** Product brand lockup; Grammar TextAction owns the enclosing interaction. */
export const shellNavBrandMarkClassName = cn("h-10", "w-auto", "shrink-0")
export const shellNavBrandTextClassName = cn("flex", "flex-col", "leading-none")
export const shellNavBrandNameClassName = cn("text-sm", "font-semibold", "leading-none", "text-foreground")
export const shellNavBrandSuffixClassName = cn("text-[8px]", "uppercase", "leading-none", "text-muted")

/** Full-height compact navigation body; DrawerBranch owns the outer frame and close action. */
export const shellNavDrawerContentClassName = cn("flex", "min-h-full", "min-w-0", "flex-col", "gap-6", "px-3", "py-6")
/** Primary destinations keep production's generous vertical rail rhythm inside the drawer. */
export const shellNavDrawerRoutesClassName = cn("flex", "min-w-0", "flex-col", "gap-1", "[&>button]:w-full", "[&>button]:justify-start", "[&>button]:px-3", "[&>button]:py-3")
/** Utilities are a secondary action family, separated once from route navigation. */
export const shellNavDrawerUtilitiesClassName = cn("flex", "min-w-0", "flex-col", "gap-1", "border-t", "border-separator", "pt-4", "[&>button]:w-full", "[&>button]:justify-start")
