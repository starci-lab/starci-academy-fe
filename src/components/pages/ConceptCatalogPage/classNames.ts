import { cn } from "@heroui/react"

/** Page rhythm around the public catalog. */
export const catalogPageClassName = cn("py-8")
/** Keep the catalog promise within a readable measure. */
export const catalogHeaderClassName = cn("mb-8", "flex", "max-w-3xl", "flex-col", "gap-3")
/** Responsive peer grid for the seven concepts. */
export const catalogGridClassName = cn("grid", "grid-cols-1", "gap-4", "md:grid-cols-2", "xl:grid-cols-3")
/** Give each concept summary a stable card rhythm. */
export const catalogCardBodyClassName = cn("flex", "min-h-52", "flex-col", "gap-4")
/** Keep category and difficulty as compact facts. */
export const catalogCardMetaClassName = cn("flex", "flex-wrap", "gap-2")
/** Bind title and explanation as one reading unit. */
export const catalogCardCopyClassName = cn("flex", "flex-col", "gap-2")
/** Anchor implementation and duration at the card edge. */
export const catalogCardFootClassName = cn("mt-auto", "flex", "items-center", "justify-between", "gap-3")
