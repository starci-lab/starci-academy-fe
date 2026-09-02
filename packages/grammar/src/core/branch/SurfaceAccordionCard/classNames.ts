import { cn } from "@heroui/react"
import { getSurfaceFrameClassName } from "../SurfaceCard/classNames.js"

/** Identifies the joined disclosure-card outer shell. */
export const accordionCardClassName = cn("starci-core-surface-accordion-card", "w-full", "min-w-0")
/** Selects bounded or frameless disclosure surfaces. */
export const getAccordionShellClassName = (bounded: boolean) => cn(
    "starci-core-accordion-shell",
    getSurfaceFrameClassName(bounded ? "bounded" : "frameless"),
    "w-full",
    "min-w-0",
)
/** Keeps the HeroUI primitive full-width inside the Grammar-owned surface shell. */
export const accordionRootClassName = cn("w-full", "min-w-0")
/** Identifies one HeroUI-owned disclosure row; the primitive owns sibling separators. */
export const accordionRowClassName = cn("starci-core-accordion-row", "w-full")
/** Identifies the semantic disclosure heading. */
export const accordionHeadingClassName = cn("starci-core-accordion-heading", "m-0")
/** Identifies the disclosure trigger control. */
export const accordionTriggerClassName = cn("starci-core-accordion-trigger", "w-full", "px-4", "py-3", "text-left")
/** The animated HeroUI region owns no inset, so a closed panel collapses to zero height. */
export const accordionPanelClassName = cn("starci-core-accordion-panel", "w-full", "min-w-0", "p-0")
/** Expanded content starts flush beneath its trigger while preserving the bottom and inline insets. */
export const accordionBodyClassName = cn("starci-core-accordion-body", "pt-0", "pb-3", "pl-6", "pr-4", "text-foreground")
/** Scroll owner around the joined disclosure rows. */
export const accordionScrollRegionClassName = cn("starci-core-accordion-scroll-region", "w-full", "min-w-0")
