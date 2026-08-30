import { cn } from "@heroui/react"

/** Route-level cart workspace with one calm page field. */
export const cartPageClassName = cn(
    "mx-auto",
    "flex",
    "w-full",
    "max-w-6xl",
    "min-w-0",
    "flex-col",
    "gap-6",
    "px-4",
    "py-6",
    "sm:px-6",
    "lg:px-8",
)

/** Breadcrumb and title remain one compact orientation group. */
export const cartHeaderClassName = cn("flex", "min-w-0", "flex-col", "gap-2")

/** Primary collection and secondary order summary. */
export const cartWorkspaceClassName = `${cn(
    "grid",
    "min-w-0",
    "grid-cols-1",
    "items-start",
    "gap-6",
    "lg:gap-8",
)} lg:grid-cols-[minmax(0,1fr)_20rem]`

/** Semantic list resets browser spacing while the Grammar surface owns the shell. */
export const cartListClassName = cn(
    "m-0",
    "flex",
    "min-w-0",
    "list-none",
    "flex-col",
    "divide-y",
    "divide-separator",
    "p-0",
)

/** One row keeps its own responsive anatomy inside the joined collection. */
export const cartListItemClassName = cn("min-w-0")

/** Summary remains reachable beside the list and returns inline on smaller screens. */
export const cartSummaryRailClassName = cn(
    "min-w-0",
    "lg:sticky",
    "lg:top-24",
)

/** One inset owner for totals, explanation, and the local action boundary. */
export const cartSummaryContentClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "gap-5",
    "p-4",
    "sm:p-5",
)

/** Local actions share one owner and stretch predictably. */
export const cartActionsClassName = cn(
    "grid",
    "grid-cols-1",
    "gap-2",
    "[&>button]:w-full",
    "sm:grid-cols-2",
    "lg:grid-cols-1",
)

/** Empty and failed states retain the same route measure. */
export const cartNoticeClassName = cn("p-4", "sm:p-6")
