import { cn } from "@heroui/react"

/** Identifies the joined disclosure-card outer shell. */
export const accordionCardClassName = cn("w-full", "min-w-0")
/** Selects bounded or frameless disclosure surfaces. */
export const getAccordionShellClassName = (bounded: boolean) => cn(
    "w-full", "min-w-0", bounded ? "overflow-hidden" : "border-0", bounded ? undefined : "shadow-none",
)
/** Identifies one disclosure row. */
export const accordionRowClassName = cn("w-full")
/** Identifies the semantic disclosure heading. */
export const accordionHeadingClassName = cn("m-0")
/** Identifies the disclosure trigger control. */
export const accordionTriggerClassName = cn("w-full", "text-left")
/** Identifies the expanded disclosure region. */
export const accordionPanelClassName = cn("w-full", "min-w-0")
/** Scroll owner around the joined disclosure rows. */
export const accordionScrollRegionClassName = cn("w-full", "min-w-0")
