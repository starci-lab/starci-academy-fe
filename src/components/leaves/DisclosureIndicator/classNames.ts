import { cn } from "@heroui/react"

/** Disclosure chevron state. */
export const getDisclosureIndicatorClassName = (open: boolean) => cn("shrink-0", open ? "rotate-90" : "rotate-0", "text-foreground", "transition-transform")
