import { cn } from "@heroui/react"

/** Challenge identity stays on one icon/title row. */
export const challengeHeadingClassName = cn("flex", "min-w-0", "items-start", "gap-3")

/** Countdown and viewer action form one responsive decision row. */
export const challengeActionClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "items-start",
    "gap-3",
    "sm:flex-row",
    "sm:items-center",
    "sm:justify-between",
)

/** One compact finisher row: avatar, flexible identity, trailing time. */
export const challengeFinisherClassName = `${cn(
    "grid",
    "min-w-0",
    "items-center",
    "gap-3",
    "border-b",
    "border-separator",
    "px-3",
    "py-2",
    "last:border-b-0",
)} grid-cols-[auto_minmax(0,1fr)_auto]`
