import { cn } from "@heroui/react"

/** Zero-padding body so drawer content owns its inset. */
export const drawerBodyClassName = cn("max-w-full", "min-w-0", "overflow-x-hidden", "p-0")
/** Complete the controlled vendor root without creating a second visible drawer opener. */
export const drawerControlledTriggerClassName = cn("sr-only", "pointer-events-none")
/** The overlay exit must read as a control, not a low-contrast decorative glyph. */
export const drawerCloseTriggerClassName = cn("size-10!", "rounded-full!", "border!", "border-separator!", "bg-surface!", "text-foreground!", "shadow-sm!", "hover:bg-default-100!")
/** Anchor the portal at the locked document origin instead of a stale embedded-browser fixed layer. */
export const drawerContentClassName = cn("absolute!")
/** Keep side drawers on one explicit width when the document scrollbar is locked or restored. */
export const drawerSideContentClassName = cn("w-[min(24rem,calc(100dvw-2rem))]!", "max-w-[calc(100dvw-2rem)]!")
/** A bounded side drawer must name its physical edge; vendor inset sets both sides in this host. */
export const drawerRightContentClassName = cn("left-auto!", "right-0!")
/** Keep a left side drawer physically anchored despite the vendor's bidirectional inset. */
export const drawerLeftContentClassName = cn("left-0!", "right-auto!")
/** Resolve the portal class without constraining the mobile bottom sheet. */
export const getDrawerContentClassName = (placement: "left" | "right" | "bottom") => cn(
    drawerContentClassName,
    placement === "bottom" ? undefined : drawerSideContentClassName,
    placement === "right" ? drawerRightContentClassName : undefined,
    placement === "left" ? drawerLeftContentClassName : undefined,
)
