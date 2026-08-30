import { cn } from "@heroui/react"

/** Extended tab strip layout; page chrome may opt out when its parent already owns the inset. */
export const getExtendedTabsRootClassName = (inset: "page" | "none" | undefined) => cn(
    "w-full",
    "max-w-full",
    "min-w-0",
    inset === "none" ? undefined : "px-6",
)
/** Extended tab row styling. */
export const extendedTabsClassName = cn("whitespace-nowrap")
/** Extended tab content layout. */
export const extendedTabContentClassName = cn("flex", "items-center", "gap-2")
/** Extended tab label visibility. */
export const extendedTabLabelClassName = cn("hidden", "md:inline")
