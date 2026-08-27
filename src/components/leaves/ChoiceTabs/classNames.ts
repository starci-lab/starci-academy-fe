import { cn } from "@heroui/react"

/** Resolve tab styling by variant. */
export const getChoiceTabClassName = (variant: "primary" | "secondary") => variant === "primary" ? cn("whitespace-nowrap", "rounded-full", "aria-selected:bg-surface", "aria-selected:shadow-surface") : cn("whitespace-nowrap")
/** Tab content layout. */
export const choiceTabContentClassName = cn("inline-flex", "items-center", "gap-2")
