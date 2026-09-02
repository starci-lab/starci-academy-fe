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
/**
 * The identity line a `hover="label"` press target answers on.
 *
 * THE UNDERLINE BELONGS TO THE PRESS TARGET, not to the words. It used to be `isPressLabel` on
 * `Text`, which put a claim about pointer behaviour inside a leaf that has no pointer and no
 * handler: a `Text` with the flag underlined wherever some ancestor happened to carry `group`, and
 * said nothing at all where none did. The behaviour now hangs off the control that owns the
 * gesture, and the only thing a caller still states is WHICH of its lines is the identity - a
 * structural fact that nothing else can know.
 *
 * It goes on the wrapper that already holds the identity line, so no element is added and no flex
 * row changes shape; the rule reaches the first `Text` inside it. The decoration itself is written
 * in `globals.css` beside the other cascade exceptions, because it matches values the vendor bakes
 * into `.link` rather than a rung of the scale.
 */
export const pressableLabelClassName = cn("press-label")

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
