import { cn } from "@heroui/react"
import {
    dashboardRailRowItemClassName,
    dashboardRailRowStackClassName,
} from "@/components/blocks/dashboard/classNames"

/** ListBox stack spacing aligned with the shared dashboard rail row rhythm. */
export const quickActionsListClassName = cn(dashboardRailRowStackClassName)

/** Interactive visual treatment shared by every quick-action option. */
export const quickActionsListItemClassName = cn(
    dashboardRailRowItemClassName,
    "group",
    "cursor-pointer",
    "text-foreground",
    "outline-none",
    "data-[focus-visible=true]:ring-2",
    "data-[focus-visible=true]:ring-accent",
    "data-[hovered=true]:bg-default",
)
