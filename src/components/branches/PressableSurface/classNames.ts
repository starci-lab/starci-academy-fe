import { cn } from "@heroui/react"

/** Base press target sizing and readable alignment. */
export const pressableBaseClassName = cn("w-full", "cursor-pointer", "text-left", "text-foreground", "active:opacity-70")
/** Hover response when the inner label names the destination. */
export const pressableLabelHoverClassName = cn("w-full", "cursor-pointer", "text-left", "text-foreground", "active:opacity-70", "group")
/** Hover response when the whole surface names the destination. */
export const pressableSurfaceHoverClassName = cn("w-full", "cursor-pointer", "text-left", "text-foreground", "active:opacity-70", "hover:opacity-80")

/** Select the single hover answer owned by the pressable surface. */
export const pressableHoverClassName = (hover: "label" | "surface") => hover === "label"
    ? pressableLabelHoverClassName
    : pressableSurfaceHoverClassName
