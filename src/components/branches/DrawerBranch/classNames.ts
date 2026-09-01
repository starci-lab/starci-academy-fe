import { cn } from "@heroui/react"

/** Zero-padding body so drawer content owns its inset. */
export const drawerBodyClassName = cn("max-w-full", "min-w-0", "overflow-x-hidden", "p-0")
/** Keep the real dialog name available while a navigation drawer presents an empty title row. */
export const drawerHiddenHeadingLabelClassName = cn("sr-only")
/** Complete the controlled vendor root without creating a second visible drawer opener. */
export const drawerControlledTriggerClassName = cn("sr-only", "pointer-events-none")
/** Anchor the portal at the locked document origin instead of a stale embedded-browser fixed layer. */
export const drawerContentClassName = cn("absolute!")
/** Keep side drawers on one explicit width when the document scrollbar is locked or restored. */
export const drawerSideContentClassName = cn("w-[min(24rem,calc(100dvw-2rem))]!", "max-w-[calc(100dvw-2rem)]!")
/** Focused setup work owns the phone viewport and gains one wider decision rail on desktop. */
export const drawerWorkspaceContentClassName = cn("w-dvw!", "max-w-none!", "sm:w-[26.25rem]!", "sm:max-w-[calc(100dvw-2rem)]!")
/** Remove the vendor's compact dialog cap when the workspace itself owns the viewport width. */
export const drawerWorkspaceDialogClassName = cn("w-full!", "max-w-none!")
/** Let navigation content own its own px-3/py-6 inset without a second vendor dialog inset. */
export const drawerFlushDialogClassName = cn("p-0!")
/** Compose workspace sizing and optional vendor-inset removal outside the JSX owner. */
export const getDrawerDialogClassName = (size: "default" | "workspace" = "default", inset: "default" | "none" = "default") => cn(
    size === "workspace" ? drawerWorkspaceDialogClassName : undefined,
    inset === "none" ? drawerFlushDialogClassName : undefined,
)
/** A bounded side drawer must name its physical edge; vendor inset sets both sides in this host. */
export const drawerRightContentClassName = cn("left-auto!", "right-0!")
/** Keep a left side drawer physically anchored despite the vendor's bidirectional inset. */
export const drawerLeftContentClassName = cn("left-0!", "right-auto!")
/** Resolve the portal class without constraining the mobile bottom sheet. */
export const getDrawerContentClassName = (placement: "left" | "right" | "bottom", size: "default" | "workspace" = "default") => cn(
    drawerContentClassName,
    placement === "bottom" ? undefined : size === "workspace" ? drawerWorkspaceContentClassName : drawerSideContentClassName,
    placement === "bottom" ? "[[data-dashboard-ai-open=true]_&]:h-dvh!" : undefined,
    placement === "bottom" ? "[[data-dashboard-ai-open=true]_&]:max-h-dvh!" : undefined,
    placement === "bottom" ? "[[data-dashboard-ai-open=true]_&]:rounded-none!" : undefined,
    placement === "right" ? drawerRightContentClassName : undefined,
    placement === "left" ? drawerLeftContentClassName : undefined,
)
