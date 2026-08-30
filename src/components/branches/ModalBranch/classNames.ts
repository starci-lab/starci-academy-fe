import { cn } from "@heroui/react"

/** Zero-padding body so the mounted content owns its inset. */
export const modalBodyClassName = cn("p-0")
/** Padding used by the cover-sized modal dialog. */
export const modalCoverClassName = cn("p-4")
/** Keep the controlled-root adapter mounted and focusable by API, but outside every user path. */
export const modalControlledTriggerClassName = cn("sr-only", "pointer-events-none")
