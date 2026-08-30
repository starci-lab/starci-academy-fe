import { cn } from "@heroui/react"

/** `marked-row-list` from the contract registry. */
export const courseValueListClassName = cn(
    "overflow-hidden",
    "divide-y",
    "divide-separator",
    "p-0",
    "[&>*]:px-4",
    "[&>*]:py-3",
    "[&>*:first-child]:pt-4",
    "[&>*:last-child]:pb-4",
)

/** Keep the included-value icon aligned with the first line of each promise. */
export const courseValueRowClassName = cn(
    "flex",
    "min-w-0",
    "items-start",
    "gap-3",
    "[&>svg:first-child]:mt-1",
    "[&>*:last-child]:min-w-0",
    "[&>*:last-child]:grow",
)
