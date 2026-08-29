import { cn } from "@heroui/react"

/** The week run and its current facts form one responsive summary row. */
export const streakPrimaryClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "gap-3",
    "sm:flex-row",
    "sm:items-center",
    "sm:justify-between",
    "sm:gap-4",
)

/** Current streak and record are peer facts, not separate rows. */
export const streakFactClassName = cn("flex", "min-w-0", "items-center", "gap-3")

/** Empty guidance keeps its message and action together. */
export const streakPromptClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "gap-3",
    "sm:flex-row",
    "sm:items-center",
)

/** The daily nudge owns one message/action split. */
export const streakNudgeClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "gap-3",
    "sm:flex-row",
    "sm:items-center",
    "sm:justify-between",
    "sm:gap-4",
)
