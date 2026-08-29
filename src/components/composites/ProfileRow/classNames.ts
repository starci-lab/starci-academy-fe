import { cn } from "@heroui/react"

/** Avatar, identity copy and disclosure share one compact navigation row. */
export const profileRowClassName = `${cn(
    "grid",
    "w-full",
    "min-w-0",
    "items-center",
    "gap-3",
)} grid-cols-[auto_minmax(0,1fr)_auto]`

/** Keeps long account names inside the identity column. */
export const profileRowIdentityClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "gap-0.5",
    "overflow-hidden",
    "[&>*]:truncate",
)
