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

/**
 * Boundary inset and divider for one ranked row; RankedUserRow (`layout="compact"`) owns its
 * own grid, truncation and the responsive movement/follow columns.
 */
export const communityRankedRowClassName = cn(
    "min-w-0",
    "border-t",
    "border-separator",
    "px-4",
    "py-3",
    "last:pb-4",
    "data-[dashboard-community-viewer-row=true]:bg-accent-soft",
)

/** Boundary inset for the viewer's standing summary; LeaderboardStandingRow owns its own grid. */
export const communityStandingClassName = cn("min-w-0", "px-4", "pt-4", "pb-3")

/** Keep collection-owned empty/recovery content on the same joined block rhythm; EmptyNotice owns its own inset. */
export const communityEmptyNoticeClassName = cn("border-t", "border-separator")

/** The weekly standing is the primary decision cue on this destination. */
export const communityLeagueStandingClassName = cn(
    communityStandingClassName,
    "bg-surface-secondary",
    "text-foreground",
)

/** The platform standing remains visible without competing with the weekly target. */
export const communityTopStandingClassName = cn(
    communityStandingClassName,
    "bg-surface-secondary",
    "text-foreground",
)
