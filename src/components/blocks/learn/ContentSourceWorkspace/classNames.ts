import { cn } from "@heroui/react"

/** Keeps the source toolbar attached to its reader or sandbox body. */
export const sourceWorkspaceClassName = cn("flex", "min-w-0", "flex-col", "gap-2")

/** Responsive toolbar layout for source identity, actions, and status. */
export const sourceWorkspaceToolbarClassName = cn(
    "flex",
    "flex-wrap",
    "items-center",
    "justify-between",
    "gap-2",
)
