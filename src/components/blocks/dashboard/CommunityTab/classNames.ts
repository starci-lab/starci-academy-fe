import { cn } from "@heroui/react"

/** Present community previews as equal peer surfaces with a stable vertical rhythm. */
export const communityTabClassName = cn(
    "grid",
    "min-w-0",
    "gap-6",
    "lg:grid-cols-[1.08fr_0.92fr]",
    "lg:items-start",
    "[&_.starci-core-surface-card]:bg-gradient-to-br",
    "[&_.starci-core-surface-card]:from-surface",
    "[&_.starci-core-surface-card]:to-accent/5",
    "[&_.starci-core-surface-card]:shadow-sm",
)

/** Re-compose the shared ranked-row anatomy into one compact horizontal leaderboard row. */
export const communityRankedRowClassName = cn(
    "min-w-0",
    "[&>div]:grid",
    "[&>div]:w-full",
    "[&>div]:grid-cols-[auto_auto_1fr_auto]",
    "[&>div]:items-center",
    "[&>div]:gap-2",
    "[&>div]:py-2.5",
    "sm:[&>div]:gap-3",
    "[&>div]:min-w-0",
    "[&>div>div]:min-w-0",
    "[&>div>div]:overflow-hidden",
    "[&>div>div:nth-child(3)]:truncate",
    "[&>div>div:nth-child(3)]:whitespace-nowrap",
    "[&>div>div:nth-child(3)>*]:truncate",
    "[&>div>div:nth-child(4)]:min-w-12",
    "[&>div>div:nth-child(4)]:whitespace-nowrap",
    "[&>div>div:nth-child(4)]:text-right",
    "[&>div>*:nth-child(5)]:hidden",
    "[&>div>button]:hidden",
    "sm:[&>div]:grid-cols-[auto_auto_1fr_auto_auto_auto]",
    "sm:[&>div>*:nth-child(5)]:block",
    "sm:[&>div>button]:block",
    "[&>div>button]:min-w-max",
    "[&>div>button]:shrink-0",
)

/** Keep the viewer's standing summary aligned as one compact row. */
export const communityStandingClassName = cn(
    "min-w-0",
    "[&>div]:grid",
    "[&>div]:grid-cols-[auto_1fr_auto]",
    "[&>div]:items-center",
    "[&>div]:gap-3",
    "[&>div]:py-2",
    "[&>div>div]:min-w-0",
)
