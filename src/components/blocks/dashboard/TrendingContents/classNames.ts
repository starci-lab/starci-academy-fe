import { cn } from "@heroui/react"

/** Keep rank and title as a compact, wrapping two-column result inside the local list surface. */
export const trendingContentRowClassName = cn(
    "min-w-0",
    "border-b",
    "border-separator",
    "bg-surface",
    "px-3",
    "py-2.5",
    "transition-colors",
    "last:border-b-0",
    "hover:bg-accent/5",
    "[&>div]:grid",
    "[&>div]:min-w-0",
    "[&>div]:grid-cols-[auto_1fr]",
    "[&>div]:items-start",
    "[&>div]:gap-3",
    "[&>div>div]:min-w-0",
    "[&>div>div:first-child]:flex",
    "[&>div>div:first-child]:size-6",
    "[&>div>div:first-child]:shrink-0",
    "[&>div>div:first-child]:items-center",
    "[&>div>div:first-child]:justify-center",
    "[&>div>div:first-child]:rounded-full",
    "[&>div>div:first-child]:bg-accent/10",
    "[&>div>div:last-child]:break-words",
)
