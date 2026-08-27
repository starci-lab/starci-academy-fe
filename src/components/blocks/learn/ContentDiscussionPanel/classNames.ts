import { cn } from "@heroui/react"

/** Reading-width discussion section layout. */
export const contentDiscussionPanelClassName = cn(
    "mx-auto",
    "flex",
    "w-full",
    "max-w-app-md",
    "flex-col",
    "gap-4",
    "p-4",
)

/** Joined vertical list used for settled and resting comments. */
export const contentDiscussionListClassName = cn(
    "flex",
    "w-full",
    "flex-col",
    "divide-y",
    "divide-separator",
)

/** One top-level comment's author, metadata, and body stack. */
export const contentDiscussionCommentClassName = cn(
    "flex",
    "w-full",
    "min-w-0",
    "flex-col",
    "gap-2",
    "py-3",
)
