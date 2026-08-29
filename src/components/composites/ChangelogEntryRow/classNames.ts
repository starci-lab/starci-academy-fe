import { cn } from "@heroui/react"

/** One padded, divided record inside the joined changelog surface. */
export const changelogEntryRowClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "gap-2",
    "border-b",
    "border-separator",
    "p-3",
    "last:border-b-0",
)

/** Date and category form one compact metadata line above the entry title. */
export const changelogEntryMetaClassName = cn(
    "flex",
    "min-w-0",
    "flex-wrap",
    "items-center",
    "gap-2",
)
