import { cn } from "@heroui/react"

/** Leading glyph, primary label and optional fact share one content-row seam. */
export const iconLabelFactRowClassName = `${cn(
    "grid",
    "w-full",
    "min-w-0",
    "items-center",
    "gap-3",
)} grid-cols-[auto_minmax(0,1fr)_auto]`

/** The primary label owns the flexible column and truncates before the trailing fact. */
export const iconLabelFactLabelClassName = cn("min-w-0", "[&>*]:truncate")
