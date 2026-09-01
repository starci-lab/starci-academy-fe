import { cn } from "@heroui/react"

export const subnavClassName = cn(
    "starci-core-subnav",
    "flex",
    "min-h-[3.25rem]",
    "w-full",
    "min-w-0",
    "items-center",
    "justify-between",
    "gap-3",
    "border-b",
    "border-separator",
    "bg-background",
    "px-3",
)
export const subnavCompactClassName = cn("min-[1120px]:hidden")
export const subnavStickyClassName = cn("sticky", "z-40", "transform-gpu", "will-change-transform")
export const subnavIdentityClassName = cn("starci-core-subnav-identity", "flex", "min-w-0", "items-center", "gap-2")
export const subnavLeadingClassName = cn("starci-core-subnav-leading", "shrink-0")
export const subnavTitleClassName = cn("starci-core-subnav-title", "truncate", "font-medium")
export const subnavToggleClassName = cn(
    "starci-core-subnav-toggle",
    "rounded-full",
)
