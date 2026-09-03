import { cn } from "@heroui/react"

/** Leading glyph, primary label and optional fact share one content-row seam. */
export const iconLabelFactRowClassName = cn(
    "flex",
    "w-full",
    "min-w-0",
    "items-center",
    "gap-3",
)

/** The primary label owns the flexible middle cell and truncates before the trailing fact. */
export const iconLabelFactLabelClassName = cn("min-w-0", "flex-1", "[&>*]:truncate")
