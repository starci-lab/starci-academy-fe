import { cn } from "@heroui/react"

/** Match Courses: one centred main track, two full-width functions in reading order. */
export const communityTabClassName = cn("flex", "min-w-0", "flex-col", "gap-6")

/** Keep the destination action below both ranking functions on their shared trailing edge. */
export const communityActionRowClassName = cn("flex", "w-full", "justify-end")

/** Re-compose the shared ranked-row anatomy into one compact horizontal leaderboard row. */
export const communityRankedRowClassName = cn(
    "min-w-0",
    "border-t",
    "border-separator",
    "p-3",
    "data-[dashboard-community-viewer-row=true]:bg-accent-soft",
    "[&>div]:grid",
    "[&>div]:w-full",
    "[&>div]:grid-cols-[auto_auto_1fr_auto]",
    "[&>div]:items-center",
    "[&>div]:gap-2",
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
    "p-3",
    "[&>div]:grid",
    "[&>div]:grid-cols-[auto_1fr_auto]",
    "[&>div]:items-center",
    "[&>div]:gap-3",
    "[&>div>div]:min-w-0",
)

/** Keep collection-owned empty/recovery content on the same joined block rhythm. */
export const communityEmptyNoticeClassName = cn(
    "border-t",
    "border-separator",
    "[&>div]:p-3",
)

/** The weekly standing is the primary decision cue on this destination. */
export const communityLeagueStandingClassName = cn(
    communityStandingClassName,
    "bg-surface-secondary",
    "text-foreground",
    "[&_[data-size=sm]]:!text-foreground",
)

/** The platform standing remains visible without competing with the weekly target. */
export const communityTopStandingClassName = cn(
    communityStandingClassName,
    "bg-surface-secondary",
    "text-foreground",
    "[&_[data-size=sm]]:!text-foreground",
)
