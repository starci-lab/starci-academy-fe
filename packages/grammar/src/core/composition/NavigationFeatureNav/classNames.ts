import { cn } from "@heroui/react"

export const navigationFeatureNavClassName = cn(
    "starci-core-navigation-feature-nav",
    "w-full",
    "border-b",
    "border-separator",
    "bg-background",
    "text-foreground",
)

export const navigationFeatureNavStickyClassName = cn("sticky", "top-0", "z-50")

export const navigationFeatureNavPrimaryClassName = cn(
    "starci-core-navigation-feature-nav-primary",
)

export const navigationFeatureNavIdentityClassName = cn("starci-core-navigation-feature-nav-identity", "min-w-0")
export const navigationFeatureNavNavigationClassName = cn("starci-core-navigation-feature-nav-navigation", "min-w-0")
export const navigationFeatureNavCompactNavigationClassName = cn("starci-core-navigation-feature-nav-compact-navigation", "min-w-0")
export const navigationFeatureNavActionsClassName = cn("starci-core-navigation-feature-nav-actions", "flex", "min-w-0", "items-center", "justify-end", "gap-2")
export const navigationFeatureNavFeatureClassName = cn("starci-core-navigation-feature-nav-feature", "min-w-0")
