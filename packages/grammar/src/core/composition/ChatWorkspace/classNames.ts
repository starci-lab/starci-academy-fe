import { cn } from "@heroui/react"

/** Bounded height chain for a workbench supplied with height by its host. */
export const chatWorkspaceClassName = cn(
    "starci-core-chat-workspace",
    "flex",
    "h-full",
    "min-h-0",
    "min-w-0",
    "flex-col",
    "overflow-hidden",
    "bg-background",
)

/** Header remains outside every workspace-owned scroll region. */
export const chatWorkspaceHeaderClassName = cn("starci-core-chat-workspace-header", "min-w-0", "shrink-0")

/** Compact rail disclosure has its own non-scrolling action boundary. */
export const chatWorkspaceRailTriggerBoundaryClassName = cn(
    "starci-core-chat-workspace-rail-trigger-boundary",
    "flex",
    "min-w-0",
    "shrink-0",
    "justify-end",
    "border-b",
    "border-separator",
    "px-4",
    "py-2",
)

/** Visible, keyboard-sized trigger for the compact supporting overlay. */
export const chatWorkspaceRailTriggerClassName = cn(
    "starci-core-chat-workspace-rail-trigger",
    "inline-flex",
    "min-h-11",
    "min-w-11",
    "items-center",
    "justify-center",
    "rounded-lg",
    "border",
    "border-separator",
    "bg-surface",
    "px-3",
    "text-sm",
    "font-medium",
    "text-foreground",
    "shadow-sm",
    "outline-none",
    "transition-colors",
    "hover:bg-default-100",
    "focus-visible:ring-2",
    "focus-visible:ring-focus",
    "focus-visible:ring-offset-2",
) ?? ""

/** Primary work region and the persistent rail share the remaining bounded height. */
export const chatWorkspaceLayoutClassName = cn(
    "starci-core-chat-workspace-layout",
    "grid",
    "min-h-0",
    "min-w-0",
    "flex-1",
    "gap-[var(--starci-core-region-gap,1.5rem)]",
)

/** Bind the layout column to the same authored widths as Core Rail. */
export const getChatWorkspaceLayoutClassName = (
    _railWidth: "compact" | "standard" | "wide",
    hasRail: boolean,
) => cn(chatWorkspaceLayoutClassName, !hasRail && "starci-core-chat-workspace-layout-without-rail")

/** Main task owner: only its conversation child scrolls. */
export const chatWorkspacePrimaryClassName = cn(
    "starci-core-chat-workspace-primary",
    "flex",
    "min-h-0",
    "min-w-0",
    "flex-col",
    "overflow-hidden",
)

/** The conversation is the single primary bounded scroll owner. */
export const chatWorkspaceConversationClassName = cn(
    "starci-core-chat-workspace-conversation",
    "min-h-0",
    "min-w-0",
    "flex-1",
    "overflow-y-auto",
    "overscroll-contain",
    "scroll-smooth",
    "focus-visible:outline-2",
    "focus-visible:outline-offset-[-2px]",
    "focus-visible:outline-focus",
    "motion-reduce:scroll-auto",
)

/** Composer remains reachable at the terminal edge without duplicating scroll padding. */
export const chatWorkspaceComposerClassName = cn(
    "starci-core-chat-workspace-composer",
    "min-w-0",
    "shrink-0",
    "border-t",
    "border-separator",
    "bg-background",
)

/** Persistent supporting rail fills the same bounded layout track as the task owner. */
export const chatWorkspaceInlineRailClassName = cn("starci-core-chat-workspace-inline-rail", "min-h-0", "min-w-0")

/** Keep the compact vendor drawer on one safe viewport width. */
export const chatWorkspaceDrawerContentClassName = cn(
    "starci-core-chat-workspace-drawer-content",
    "left-auto!",
    "right-0!",
    "w-[min(24rem,calc(100dvw-1rem))]!",
    "max-w-[calc(100dvw-1rem)]!",
) ?? ""

/** The dialog and its body extend the bounded height chain into the overlay. */
export const chatWorkspaceDrawerDialogClassName = cn("starci-core-chat-workspace-drawer-dialog", "h-full!", "min-h-0!", "w-full!", "max-w-none!") ?? ""
export const chatWorkspaceDrawerBodyClassName = cn("starci-core-chat-workspace-drawer-body", "min-h-0", "min-w-0", "overflow-hidden", "p-0") ?? ""

/** Scroll owner inside the compact supporting overlay. */
export const chatWorkspaceOverlayRailClassName = cn(
    "starci-core-chat-workspace-overlay-rail",
    "h-full",
    "min-h-0",
    "min-w-0",
    "overflow-y-auto",
    "overscroll-contain",
    "p-4",
    "focus-visible:outline-2",
    "focus-visible:outline-offset-[-2px]",
    "focus-visible:outline-focus",
)

/** Make the vendor-provided overlay exit easy to target in every input mode. */
export const chatWorkspaceDrawerCloseClassName = cn(
    "starci-core-chat-workspace-drawer-close",
    "size-10!",
    "rounded-full!",
    "border!",
    "border-separator!",
    "bg-surface!",
    "text-foreground!",
    "shadow-sm!",
) ?? ""
