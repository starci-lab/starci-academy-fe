import { cn } from "@heroui/react"

/** Stable comparison axis for the order's derived figures. */
export const orderSummaryClassName = cn("flex", "min-w-0", "flex-col", "gap-3")

/** Supporting figures remain subordinate and aligned. */
export const orderSummaryRowClassName = cn(
    "flex",
    "min-w-0",
    "items-baseline",
    "justify-between",
    "gap-4",
)

/** The payable total closes the comparison with stronger separation. */
export const orderSummaryTotalClassName = cn(
    orderSummaryRowClassName,
    "mt-1",
    "border-t",
    "border-separator",
    "pt-4",
)
