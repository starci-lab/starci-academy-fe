import { cn } from "@heroui/react"

/** Responsive frame: the project roadmap is persistent only when two rails still leave a useful task plane. */
export const personalProjectWorkspaceClassName = cn(
    "flex",
    "w-full",
    "min-w-0",
    "flex-col",
    "2xl:flex-row",
    "2xl:items-start",
)

/** Compact roadmap entry used whenever the persistent project rail would crowd the task. */
export const personalProjectWorkspaceMobileBarClassName = cn(
    "flex",
    "w-full",
    "min-w-0",
    "items-center",
    "justify-between",
    "gap-3",
    "border-b",
    "border-separator",
    "px-4",
    "py-3",
    "2xl:hidden",
)

/** The full project roadmap owns one bounded rail on wide workspaces only. */
export const personalProjectWorkspaceRailClassName = cn(
    "hidden",
    "h-[calc(100vh-4rem)]",
    "w-80",
    "min-w-64",
    "shrink-0",
    "overflow-hidden",
    "2xl:sticky",
    "2xl:top-16",
    "2xl:block",
)

/** Routed project surface keeps the remaining width and may never force horizontal overflow. */
export const personalProjectWorkspaceSurfaceClassName = cn("w-full", "min-w-0", "flex-1", "2xl:w-auto")

/** The drag divider follows the same wide-only ownership as the persistent rail. */
export const personalProjectWorkspaceDividerClassName = cn("hidden", "2xl:block")
