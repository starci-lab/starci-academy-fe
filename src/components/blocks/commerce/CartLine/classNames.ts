import { cn } from "@heroui/react"

/** One compact cart row; narrow screens keep image, identity, price, and removal reachable. */
export const cartLineClassName = `${cn(
    "grid",
    "min-w-0",
    "items-center",
    "gap-x-3",
    "gap-y-2",
    "p-4",
    "sm:gap-x-4",
    "sm:p-5",
)} grid-cols-[6rem_minmax(0,1fr)_auto] sm:grid-cols-[9rem_minmax(0,1fr)_auto_auto]`

/** The image is supporting evidence, not the surface owner. */
export const cartLineCoverClassName = cn(
    "row-span-2",
    "w-24",
    "min-w-0",
    "sm:row-span-1",
    "sm:w-36",
)

/** Course identity receives the flexible reading width. */
export const cartLineIdentityClassName = cn(
    "min-w-0",
    "self-center",
    "break-words",
)

/** Payable price leads its qualifiers without competing with course identity. */
export const cartLinePriceClassName = cn(
    "col-start-2",
    "flex",
    "min-w-0",
    "flex-wrap",
    "items-baseline",
    "gap-2",
    "sm:col-start-3",
    "sm:flex-col",
    "sm:items-end",
    "sm:gap-1",
)

/** Destructive row action stays quiet and anchored at the trailing edge. */
export const cartLineRemoveClassName = cn(
    "col-start-3",
    "row-start-1",
    "self-start",
    "sm:col-start-4",
    "sm:self-center",
)
