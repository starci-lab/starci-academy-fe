import { cn } from "@heroui/react"

/** Removes default list padding while retaining compact spacing between actions. */
export const quickActionsListClassName = cn("gap-1", "p-0")

/** Interactive visual treatment shared by every quick-action option. */
export const quickActionsListItemClassName = cn(
    "group",
    "flex",
    "cursor-pointer",
    "items-center",
    "gap-2",
    "rounded-large",
    "px-2",
    "py-2",
    "text-foreground",
    "outline-none",
    "data-[focus-visible=true]:ring-2",
    "data-[focus-visible=true]:ring-accent",
    "data-[hovered=true]:bg-default",
)
