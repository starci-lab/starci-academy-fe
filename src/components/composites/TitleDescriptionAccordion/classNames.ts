import { cn } from "@heroui/react"

/** `title-description-accordion` from the contract registry. */
export const titleDescriptionClassName = cn("flex", "min-w-0", "flex-col", "gap-3")
/** Contract summary row for a title/description disclosure. */
export const titleDescriptionSummaryClassName = cn("flex", "w-full", "min-w-0", "items-center", "gap-3", "text-left", "[&>*:first-child]:min-w-0", "[&>*:first-child]:grow", "[&>*:last-child]:shrink-0")
/** Contract body row for a title/description disclosure. */
export const titleDescriptionBodyClassName = cn("flex", "w-full", "min-w-0", "flex-col")
