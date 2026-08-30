import { cn } from "@heroui/react"

/** Identifies the joined disclosure-card outer shell. */
export const accordionCardClassName = cn("w-full", "min-w-0")
/** Selects bounded or frameless disclosure surfaces. */
export const getAccordionShellClassName = (bounded: boolean) => cn(
    "w-full", "min-w-0", bounded ? "overflow-hidden" : "border-0", bounded ? undefined : "shadow-none",
)
/** Identifies one HeroUI-owned disclosure row; the primitive owns sibling separators. */
export const accordionRowClassName = cn("w-full")
/** Identifies the semantic disclosure heading. */
export const accordionHeadingClassName = cn("m-0")
/** Identifies the disclosure trigger control. */
export const accordionTriggerClassName = cn("w-full", "px-4", "py-3", "text-left")
/** Identifies the animated HeroUI disclosure region without inventing an inner divider. */
export const accordionPanelClassName = cn("w-full", "min-w-0")
/** Keeps panel content inside the trigger's horizontal inset. */
export const accordionBodyClassName = cn("px-4", "pb-4", "pt-0", "text-foreground")
/** Scroll owner around the joined disclosure rows. */
export const accordionScrollRegionClassName = cn("w-full", "min-w-0")
