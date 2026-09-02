import { cn } from "@heroui/react"

/** Put the image above the list on compact screens and beside it on wide screens. */
export const trendingContentClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "lg:flex-row",
    "lg:items-stretch",
    "lg:justify-between",
)

/** Let the ranked destinations take the flexible side of the card. */
export const trendingListClassName = cn(
    "order-2",
    "min-w-0",
    "flex-1",
    "overflow-hidden",
    "border-t",
    "border-separator",
    "lg:order-1",
    "lg:border-t-0",
)

/** Keep generated discovery media prominent without becoming a separate card. */
export const trendingMediaClassName = cn(
    "order-1",
    "flex",
    "items-center",
    "justify-center",
    "w-full",
    "bg-accent-soft",
    "p-4",
    "lg:order-2",
    "lg:w-[38%]",
    "lg:shrink-0",
    "lg:border-l",
    "lg:border-separator",
)

/** Keep rank and title as a compact, wrapping two-column result inside the local list surface. */
export const trendingContentRowClassName = cn(
    "min-w-0",
    "border-b",
    "border-separator",
    "bg-surface/90",
    "last:border-b-0",
    "[&>button]:px-4",
    "[&>button]:py-3",
    "lg:first:[&>button]:pt-4",
    "[&>button>div]:grid",
    "[&>button>div]:min-w-0",
    "[&>button>div]:grid-cols-[auto_1fr]",
    "[&>button>div]:items-start",
    "[&>button>div]:gap-3",
    "[&>button>div>div]:min-w-0",
    "[&>button>div>div:first-child]:flex",
    "[&>button>div>div:first-child]:size-6",
    "[&>button>div>div:first-child]:shrink-0",
    "[&>button>div>div:first-child]:items-center",
    "[&>button>div>div:first-child]:justify-center",
    "[&>button>div>div:first-child]:rounded-full",
    "[&>button>div>div:first-child]:bg-accent/10",
    "[&>button>div>div:last-child]:break-words",
)
