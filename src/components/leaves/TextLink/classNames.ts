import { cn } from "@heroui/react"

/** Resolve text-link styling by size and selection state. */
export const getTextLinkClassName = (size: "xs" | "sm" | "md", selected: boolean | undefined) => cn(size === "xs" ? "text-xs" : size === "sm" ? "text-sm" : "text-base", selected === undefined ? undefined : "rounded-full", selected === undefined ? undefined : "px-2", selected === undefined ? undefined : "py-1", selected === true ? "bg-accent-soft" : undefined, selected === true ? "text-accent-soft-foreground" : undefined)
