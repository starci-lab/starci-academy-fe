import { cn } from "@heroui/react"

/** Identifies the rail landmark wrapper. */
export const railClassName = cn("starci-core-rail", "min-w-0")
/** Identifies the rail's internal frame. */
export const railFrameClassName = cn("starci-core-rail-frame", "flex", "min-w-0", "flex-col")
/** Identifies the rail's primary body region. */
export const railBodyClassName = cn("starci-core-rail-body", "min-w-0", "flex-1")
/** Identifies the optional rail footer region. */
export const railFooterClassName = cn("starci-core-rail-footer", "flex", "items-center")
