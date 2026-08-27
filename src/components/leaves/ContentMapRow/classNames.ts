import { cn } from "@heroui/react"

/** Content map row styling. */
export const getContentMapRowClassName = (current: boolean) => cn("flex", "w-full", "flex-row", "items-start", "gap-3", "rounded-medium", "px-3", "py-2", "text-start", "[&>*:first-child]:shrink-0", "[&>*:nth-child(2)]:min-w-0", "[&>*:nth-child(2)]:grow", "[&>*:last-child]:shrink-0", current ? "bg-accent-soft" : undefined, current ? "text-accent-soft-foreground" : undefined)
