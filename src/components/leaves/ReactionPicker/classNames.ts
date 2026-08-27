import { cn } from "@heroui/react"

/** Resolve the fixed optical size for a reaction image placement. */
export const getReactionImageClassName = (size: "summary" | "picker") => cn(
    "inline-block",
    "shrink-0",
    "select-none",
    size === "picker" ? "size-7" : "size-4",
)

/** Compact read-only count treatment. */
export const reactionSummaryClassName = cn("flex", "items-center", "gap-1", "text-xs", "text-muted")

/** Positioning context shared by the trigger and its picker. */
export const reactionPickerClassName = cn("relative", "flex", "items-center")

/** Floating reaction menu chrome. */
export const reactionPickerMenuClassName = cn(
    "absolute",
    "bottom-full",
    "left-0",
    "z-10",
    "mb-1",
    "flex",
    "items-center",
    "gap-1",
    "rounded-full",
    "bg-surface",
    "p-1",
    "ring-1",
    "ring-separator",
)

/** Resolve one reaction choice, including its selected treatment. */
export const getReactionChoiceClassName = (isSelected: boolean) => cn(
    "group/reaction",
    "relative",
    "flex",
    "items-center",
    "justify-center",
    "rounded-full",
    "p-1",
    "focus-visible:outline",
    "focus-visible:outline-2",
    "focus-visible:outline-offset-1",
    "focus-visible:outline-accent",
    isSelected && "bg-accent-soft",
)

/** Hover label displayed above a reaction choice. */
export const reactionTooltipClassName = cn(
    "pointer-events-none",
    "absolute",
    "-top-7",
    "left-1/2",
    "-translate-x-1/2",
    "whitespace-nowrap",
    "rounded-full",
    "bg-foreground",
    "px-2",
    "text-[10px]",
    "font-medium",
    "text-background",
    "opacity-0",
    "transition-opacity",
    "group-hover/reaction:opacity-100",
)
