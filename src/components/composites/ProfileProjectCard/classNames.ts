import { cn } from "@heroui/react"

/** Project verification, identity, and technologies stack. */
export const profileProjectCardClassName = cn("flex", "min-h-full", "min-w-0", "max-w-full", "flex-col", "gap-3", "break-words", "[overflow-wrap:anywhere]", "p-5")
/** Verification and destination affordance share the project eyebrow. */
export const profileProjectHeaderClassName = cn("flex", "min-w-0", "items-center", "justify-between", "gap-3")
/** Wrapping project technology facts. */
export const profileProjectTechRunClassName = cn("flex", "flex-row", "flex-wrap", "items-center", "gap-2")
/** The whole tile is pressable; this quiet terminal cue makes the outcome explicit. */
export const profileProjectActionClassName = cn("mt-auto", "border-t", "border-separator", "pt-3")
