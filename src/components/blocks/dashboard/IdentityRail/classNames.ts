import { cn } from "@heroui/react"
import { dashboardRailRowStackClassName } from "@/components/blocks/dashboard/classNames"

/** Stack the identity anchor and standing figures with section spacing. */
export const identityRailClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "gap-4",
)

/** Match quick-access row stack rhythm for the three standing figures. */
export const identityRailStatsClassName = dashboardRailRowStackClassName
