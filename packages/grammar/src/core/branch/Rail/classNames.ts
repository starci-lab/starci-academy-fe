import { cn } from "@heroui/react"

/** Identifies the rail landmark wrapper. */
export const railClassName = cn("min-w-0")
/** Identifies the rail's internal frame. */
export const railFrameClassName = cn("flex", "min-w-0", "flex-col")
/** Identifies the rail's primary body region. */
export const railBodyClassName = cn("min-w-0", "flex-1")
/** Identifies the optional rail footer region. */
export const railFooterClassName = cn("flex", "items-center")
