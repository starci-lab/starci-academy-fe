import { cn } from "@heroui/react"

/** Drawer content stack for immutable challenge attempts. */
export const challengeAttemptHistoryClassName = cn(
    "flex",
    "w-full",
    "min-w-0",
    "flex-col",
    "gap-3",
    "p-4",
)

/** One selectable challenge attempt and its immutable metadata. */
export const challengeAttemptHistoryRowClassName = cn(
    "flex",
    "w-full",
    "min-w-0",
    "flex-col",
    "gap-2",
    "border-t",
    "border-separator",
    "py-3",
)
