import { cn } from "@heroui/react"

/** Select surface label copy that recedes when the owner is nested. */
export const getLabelClassName = (depth: "top" | "nested") => cn(
    "starci-core-label",
    "min-w-0",
    "font-medium",
    depth === "nested" ? "text-xs leading-4" : "text-sm leading-5",
)
