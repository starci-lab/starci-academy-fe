import { cn } from "@heroui/react"

/** Grid cards keep image, decision evidence and actions in one vertical unit. */
export const catalogCardGridClassName = cn("flex", "grow", "flex-col", "gap-4", "p-4")
/** Line cards stack on phones, then use the contract's scan row once the measure permits. */
export const catalogCardLineClassName = cn(
    "flex",
    "flex-col",
    "items-stretch",
    "gap-4",
    "sm:flex-row",
    "sm:items-center",
    "[&>*:first-child]:w-full",
    "[&>*:first-child]:shrink-0",
    "sm:[&>*:first-child]:w-36",
    "[&>*:nth-child(2)]:min-w-0",
    "[&>*:nth-child(2)]:grow",
    "[&>*:last-child]:w-full",
    "sm:[&>*:last-child]:w-auto",
    "sm:[&>*:last-child]:shrink-0",
)
/** Bound artwork so a cover never becomes a page-sized banner. */
export const catalogCardCoverClassName = cn("min-w-0", "overflow-hidden")
/** Let identity and commercial evidence use the remaining measure. */
export const catalogCardBodyClassName = cn("flex", "min-w-0", "flex-1", "flex-col", "gap-4")
/** `catalog-card-line-body` from the contract registry. */
export const catalogCardLineBodyClassName = cn("flex", "min-w-0", "grow", "flex-col", "gap-1")
/** Keep title and enrolment evidence together. */
export const catalogCardIdentityClassName = cn("flex", "min-w-0", "items-baseline", "justify-between", "gap-2")
/** Keep price and its explanation in a compact evidence group. */
export const catalogCardCommerceClassName = cn("flex", "min-w-0", "flex-col", "gap-1")
/** Keep current and superseded prices readable as one line. */
export const catalogCardPriceClassName = cn("flex", "min-w-0", "flex-wrap", "items-center", "gap-2")
/** Keep savings directly attached to the price disclosure. */
export const catalogCardPriceNoteClassName = cn("flex", "min-w-0", "flex-nowrap", "items-center", "gap-2", "[&>*]:whitespace-nowrap")
/** Preserve one primary action without allowing controls to overlap content. */
export const catalogCardActionsClassName = cn("flex", "flex-row", "items-center", "gap-2", "[&>*]:w-full")
/** Line actions share the phone width and return to intrinsic width beside the row body. */
export const catalogCardLineActionsClassName = cn("flex", "flex-row", "items-center", "gap-2", "[&>*]:min-w-0", "[&>*]:flex-1", "sm:[&>*]:flex-none")
