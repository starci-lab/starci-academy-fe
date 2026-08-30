import { cn } from "@heroui/react"

/** Identifies the joined disclosure-card outer shell. */
export const accordionCardClassName = cn("starci-core-surface-accordion-card", "w-full", "min-w-0")
/** Selects bounded or frameless disclosure surfaces. */
export const getAccordionShellClassName = (bounded: boolean) => cn(
    "starci-core-accordion-shell",
    bounded ? undefined : "starci-core-accordion-shell-frameless",
    "w-full", "min-w-0", bounded ? "overflow-hidden" : "border-0", bounded ? undefined : "shadow-none",
)
/** Identifies one HeroUI-owned disclosure row; the primitive owns sibling separators. */
export const accordionRowClassName = cn("starci-core-accordion-row", "w-full")
/** Identifies the semantic disclosure heading. */
export const accordionHeadingClassName = cn("starci-core-accordion-heading", "m-0")
/** Identifies the disclosure trigger control. */
export const accordionTriggerClassName = cn("starci-core-accordion-trigger", "w-full", "px-4", "py-3", "text-left")
/** Identifies the animated HeroUI disclosure region without inventing an inner divider. */
export const accordionPanelClassName = cn("starci-core-accordion-panel", "w-full", "min-w-0")
/** Keeps panel content inside the trigger's horizontal inset. */
export const accordionBodyClassName = cn("starci-core-accordion-body", "px-4", "pb-4", "pt-0", "text-foreground")
/** Scroll owner around the joined disclosure rows. */
export const accordionScrollRegionClassName = cn("starci-core-accordion-scroll-region", "w-full", "min-w-0")
