import { cn } from "@heroui/react"

/** Main course leaderboard page column. */
export const courseLeaderboardPageClassName = cn("mx-auto", "flex", "w-full", "max-w-6xl", "flex-col", "gap-6", "px-6", "py-6")

/** Breadcrumb and title stack. */
export const courseLeaderboardHeaderClassName = cn("flex", "flex-col", "gap-3")

/** Keeps the scope selector sized to its content. */
export const courseLeaderboardScopeClassName = cn("flex", "flex-row")

/** Standing, podium, and ranked-list stack. */
export const courseLeaderboardBoardClassName = cn("flex", "flex-col", "gap-6")

/** Centred marker between non-adjacent ranking rows. */
export const rankedUserEllipsisClassName = cn("flex", "flex-row", "items-center", "justify-center", "gap-2", "py-2")
