import { cn } from "@heroui/react"

/** Let side-panel and compact sessions read as one page; only full desktop retains the bounded workbench. */
export const mockInterviewRoomClassName = cn(
    "h-auto",
    "min-h-0",
    "overflow-visible",
    "lg:h-full",
    "lg:overflow-hidden",
    "lg:[&_[data-grammar-chat-workspace-slot=composer]]:mx-auto",
    "lg:[&_[data-grammar-chat-workspace-slot=composer]]:mb-4",
    "lg:[&_[data-grammar-chat-workspace-slot=composer]]:w-full",
    "lg:[&_[data-grammar-chat-workspace-slot=composer]]:max-w-4xl",
    "lg:[&_[data-grammar-chat-workspace-slot=composer]]:rounded-2xl",
    "lg:[&_[data-grammar-chat-workspace-slot=composer]]:border",
    "lg:[&_[data-grammar-chat-workspace-slot=composer]]:border-separator",
    "lg:[&_[data-grammar-chat-workspace-slot=composer]]:bg-surface",
    "lg:[&_[data-grammar-chat-workspace-slot=composer]]:shadow-sm",
    "max-lg:[&_[data-grammar-chat-workspace-layout=true]]:block",
    "max-lg:[&_[data-grammar-chat-workspace-slot=primary]]:overflow-visible",
    "max-lg:[&_[data-grammar-chat-workspace-slot=conversation]]:overflow-visible",
)
/** Keep room identity, actions and progress in one compact header. */
export const mockInterviewHeaderClassName = cn("grid", "min-w-0", "gap-3", "border-b", "border-separator", "bg-background", "px-4", "py-3", "sm:grid-cols-[1fr_auto]", "sm:px-6")
/** Stack the live room title and connection state. */
export const mockInterviewHeaderCopyClassName = cn("flex", "min-w-0", "flex-col", "gap-1")
/** Group terminal interview actions without forcing overflow. */
export const mockInterviewHeaderActionsClassName = cn("flex", "min-w-0", "flex-wrap", "items-center", "gap-2", "sm:justify-end")
/** Align question position, progress and time remaining. */
export const mockInterviewHeaderFactsClassName = cn("grid", "min-w-0", "grid-cols-[auto_minmax(6rem,1fr)_auto]", "items-center", "gap-3", "sm:col-span-2")
/** Keep the whole active mission reachable from the start of the bounded scroll owner. */
export const mockInterviewConversationClassName = cn("mx-auto", "flex", "min-h-0", "w-full", "max-w-4xl", "min-w-0", "flex-col", "justify-start", "gap-4", "p-4", "sm:p-6", "lg:min-h-full", "lg:justify-center")
/** Give the active interview question a readable inset. */
export const mockInterviewQuestionClassName = cn("flex", "min-w-0", "flex-col", "gap-4", "p-5", "sm:p-8")
/** Keep question identity and position visibly paired. */
export const mockInterviewQuestionMetaClassName = cn("flex", "min-w-0", "flex-wrap", "items-center", "justify-between", "gap-2")
/** Bound the answer composer to the same reading measure as the question. */
export const mockInterviewComposerClassName = cn("mx-auto", "flex", "w-full", "max-w-4xl", "min-w-0", "flex-col", "gap-3", "bg-background", "p-4", "sm:px-6")
/** Keep save or recovery evidence stable above the compact action and beside it on wider surfaces. */
export const mockInterviewComposerActionsClassName = cn("grid", "min-w-0", "grid-cols-1", "items-end", "gap-2", "sm:grid-cols-[1fr_auto]")
/** Keep composer controls at the same terminal edge across normal and recovery states. */
export const mockInterviewComposerButtonsClassName = cn("flex", "min-w-0", "flex-wrap", "items-center", "justify-end", "gap-2")
/** Give a restored-server notice enough contrast to communicate a material recovery transition. */
export const mockInterviewNoticeClassName = cn("rounded-xl", "bg-accent-soft", "px-3", "py-2", "text-accent-soft-foreground")
/** Stack transcript identity and its scroll-owned entries. */
export const mockInterviewTranscriptClassName = cn("flex", "h-full", "min-w-0", "flex-col", "gap-3", "rounded-2xl", "border", "border-separator", "bg-surface", "p-5", "shadow-sm")
/** Remove list chrome while preserving row separators. */
export const mockInterviewTranscriptListClassName = cn("m-0", "list-none", "p-0", "[&>*+*]:border-t", "[&>*+*]:border-separator")
/** Distinguish candidate transcript entries from interviewer prompts. */
export const mockInterviewTranscriptItemClassName = cn("flex", "min-w-0", "flex-col", "gap-2", "py-4", "break-words", "data-[role=candidate]:rounded-xl", "data-[role=candidate]:bg-accent-soft", "data-[role=candidate]:px-3")
/** Center terminal loading, expiry and failure states. */
export const mockInterviewStateClassName = cn("mx-auto", "flex", "min-h-[calc(100dvh-8rem)]", "w-full", "max-w-3xl", "min-w-0", "items-center", "justify-center", "p-4", "sm:p-6")
/** Space destructive and completion confirmation copy. */
export const mockInterviewConfirmationClassName = cn("flex", "min-w-0", "flex-col", "gap-4", "p-5", "sm:p-6")
/** Keep confirmation actions ordered safely across viewports. */
export const mockInterviewConfirmationActionsClassName = cn("flex", "min-w-0", "flex-col-reverse", "gap-2", "sm:flex-row", "sm:justify-end")
