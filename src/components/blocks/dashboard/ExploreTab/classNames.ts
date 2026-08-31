import { cn } from "@heroui/react"

/** Stack Explore's independent surfaces with a clear reading rhythm at every width. */
export const exploreTabClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
)

/** The activity stream carries the reading weight of Explore. */
export const exploreFeedPanelClassName = cn("min-w-0")

/** Keep feed controls and results together while allowing compact-width reflow. */
export const exploreFeedClassName = cn("flex", "min-w-0", "flex-col", "gap-6")
