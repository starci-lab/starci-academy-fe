import { cn } from "@heroui/react"

/** Shared native-control affordance; feedback never removes keyboard focus. */
export const pressableBaseClassName = cn(
    "w-full",
    "cursor-pointer",
    "text-left",
    "text-foreground",
    "focus-visible:outline-2",
    "focus-visible:outline-offset-[-2px]",
    "focus-visible:outline-focus",
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
)
/** Inline-action feedback: only the named label/CTA answers through its group state. */
export const pressableLabelHoverClassName = cn(
    pressableBaseClassName,
    "group",
)
/** Whole-action feedback: the complete press target changes material, never only its title. */
export const pressableSurfaceHoverClassName = cn(
    pressableBaseClassName,
    "group",
    "transition-colors",
    "duration-200",
    "hover:bg-accent-soft",
    "focus-visible:bg-accent-soft",
    "active:bg-accent-soft/80",
    "motion-reduce:transition-none",
)

/** Select the single hover answer owned by the pressable surface. */
export const pressableHoverClassName = (hover: "label" | "surface") => hover === "label"
    ? pressableLabelHoverClassName
    : pressableSurfaceHoverClassName
