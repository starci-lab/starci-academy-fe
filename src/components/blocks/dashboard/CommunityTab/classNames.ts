import { cn } from "@heroui/react"
import { buttonVariants } from "@heroui/styles"

/** Match Courses: one centred main track, two full-width functions in reading order. */
export const communityTabClassName = cn("flex", "min-w-0", "flex-col", "gap-4")

/** Keep the two ranking functions together as one peer card group. */
export const communityCardsClassName = cn("flex", "min-w-0", "flex-col", "gap-6")

/** Keep the destination action below both ranking functions on their shared trailing edge. */
export const communityActionRowClassName = cn("flex", "w-full", "justify-end")

/** Primary visual treatment for the native destination link below both ranking cards. */
export const communityDestinationLinkClassName = cn(buttonVariants({ variant: "primary", size: "sm" }))

/** Re-compose the shared ranked-row anatomy into one compact horizontal leaderboard row. */
export const communityRankedRowClassName = cn(
    "min-w-0",
    "border-t",
    "border-separator",
    "px-4",
    "py-3",
    "last:pb-4",
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
    "px-4",
    "pt-4",
    "pb-3",
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
    "[&>div]:px-4",
    "[&>div]:pt-3",
    "[&>div]:pb-4",
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
