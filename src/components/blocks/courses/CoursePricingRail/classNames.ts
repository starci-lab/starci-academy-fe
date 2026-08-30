import { cn } from "@heroui/react"

/** Keep the rail's evidence in a compact decision stack. */
export const pricingRailClassName = cn("relative", "flex", "min-w-0", "flex-col", "gap-4", "p-4")
/** Keep the primary purchase decision and secondary comparison as peer surfaces. */
export const pricingRailSurfaceStackClassName = cn("flex", "min-w-0", "flex-col", "gap-6")
/** Keep the payable and superseded prices visually related. */
export const pricingRailPriceClassName = cn("flex", "min-w-0", "flex-wrap", "items-center", "gap-2")
/** Keep savings and its disclosure on one readable row. */
export const pricingRailPriceNoteClassName = cn("flex", "min-w-0", "flex-wrap", "items-center", "gap-2")
/** Price and savings explanation are one compact evidence group. */
export const pricingRailPriceEvidenceClassName = cn("flex", "min-w-0", "flex-col", "gap-2")
/** Separate the explanatory copy group from its next action. */
export const pricingRailIntentClassName = cn("flex", "min-w-0", "flex-col", "gap-4")
/** Title and description explain one purchase/trial intent. */
export const pricingRailIntentCopyClassName = cn("flex", "min-w-0", "flex-col", "gap-2")
/** Stack full-width decision controls without overlap. */
export const pricingRailActionsClassName = cn("flex", "min-w-0", "flex-col", "gap-3", "[&>*]:w-full")
