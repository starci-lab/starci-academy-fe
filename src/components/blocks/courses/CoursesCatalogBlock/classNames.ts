import { cn } from "@heroui/react"

/** `courses-catalog-page` from the contract registry. */
export const catalogPageClassName = cn("mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "px-6", "py-6")
/** Keep the breadcrumb and page promise together. */
export const catalogHeaderClassName = cn("flex", "min-w-0", "flex-col", "gap-3")
/** Put search evidence and the view decision on one calm toolbar. */
export const catalogToolbarClassName = cn("flex", "flex-row", "flex-wrap", "items-center", "justify-between", "gap-4")
/** Keep result copy directly attached to the search control. */
export const catalogSearchClassName = cn("flex", "flex-row", "items-center", "gap-3", "[&>*:last-child]:shrink-0")
/** Keep the view switch compact instead of stretching across the page. */
export const catalogViewClassName = cn("shrink-0")
/** Stack the section heading over its cards. */
export const catalogSectionClassName = cn("flex", "flex-col", "gap-3")
/** Give every grid card a bounded column. */
export const catalogGridClassName = cn("grid", "grid-cols-1", "gap-2", "sm:grid-cols-2", "lg:grid-cols-3")
/** Join line rows into one deliberate reading run. */
export const catalogLineClassName = cn("overflow-hidden", "divide-y", "divide-separator", "p-0", "[&>*]:px-4", "[&>*]:py-3", "[&>*:first-child]:pt-4", "[&>*:last-child]:pb-4")
