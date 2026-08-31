import { cn } from "@heroui/react"
import { dashboardFlushListEntryClassName } from "@/components/blocks/dashboard/classNames"

/** One padded, divided record inside the joined changelog surface. */
export const changelogEntryRowClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "gap-2",
    dashboardFlushListEntryClassName,
)

/** Date and category form one compact metadata line above the entry title. */
export const changelogEntryMetaClassName = cn(
    "flex",
    "min-w-0",
    "flex-wrap",
    "items-center",
    "gap-2",
)
