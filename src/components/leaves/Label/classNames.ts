import { cn } from "@heroui/react"
import { formScreenReaderLabelClassName } from "@starci/grammar/common"

/** Inline label anatomy keeps icon and copy aligned on one baseline. */
export const labelClassName = cn("inline-flex", "items-center", "gap-2", "text-sm", "font-medium")
/** Grammar-owned treatment for a semantic label that should not occupy visual space. */
export const labelScreenReaderClassName = cn(labelClassName, formScreenReaderLabelClassName)
