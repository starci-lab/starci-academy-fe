import { cn } from "@heroui/react"

/** Messenger-like visual roles owned by the StarCi course-advisor surface. */
export const aiChatClassNames = {
    root: cn("flex", "h-[76dvh]", "min-h-[28rem]", "min-w-0", "flex-col", "bg-surface", "sm:h-full", "sm:min-h-0"),
    intro: cn("flex", "items-center", "gap-3", "border-b", "border-separator", "bg-surface", "px-4", "py-3", "shadow-sm"),
    introAvatar: cn("relative", "flex", "shrink-0"),
    introCopy: cn("flex", "min-w-0", "flex-1", "flex-col", "gap-0.5"),
    modes: cn("flex", "gap-1", "border-b", "border-separator", "bg-surface", "px-3", "py-2"),
    context: cn("mx-3", "mt-2", "flex", "items-center", "justify-between", "gap-2", "rounded-full", "bg-accent-soft", "px-3", "py-2"),
    contextCopy: cn("flex", "min-w-0", "items-center", "gap-2"),
    contextDot: cn("size-2", "shrink-0", "rounded-full", "bg-accent"),
    transcriptViewport: cn("min-h-0", "flex-1", "bg-default/30"),
    transcript: cn("flex", "min-h-full", "min-w-0", "flex-col", "gap-3", "px-3", "py-4"),
    userTurn: cn("flex", "w-full", "min-w-0", "justify-end"),
    assistantTurn: cn("flex", "w-full", "min-w-0", "items-start", "justify-start", "gap-2"),
    avatarSlot: cn("mt-1", "flex", "shrink-0"),
    turnContent: cn("min-w-0", "w-full", "max-w-[calc(100%-2.5rem)]"),
    userContent: cn("min-w-0", "max-w-[82%]"),
    userBubble: cn("min-w-0", "rounded-[1.25rem]", "rounded-br-md", "bg-accent", "px-3.5", "py-2.5", "text-sm", "text-accent-foreground", "shadow-sm", "[&_*]:text-accent-foreground"),
    assistantBubble: cn("min-w-0", "rounded-[1.25rem]", "rounded-bl-md", "bg-default", "px-3.5", "py-2.5", "text-sm", "shadow-sm"),
    recommendationList: cn("mt-2", "flex", "w-full", "flex-col", "gap-2"),
    empty: cn("m-auto", "flex", "w-full", "max-w-sm", "flex-col", "items-center", "gap-4", "px-3", "py-4", "text-center"),
    emptyCopy: cn("flex", "flex-col", "gap-2"),
    prompts: cn("flex", "w-full", "flex-wrap", "justify-center", "gap-2"),
    history: cn("flex", "flex-col", "gap-2"),
    historyActions: cn("flex", "flex-wrap", "gap-2", "border-t", "border-separator", "bg-surface", "px-4", "py-3"),
    composer: cn("flex", "flex-col", "gap-1.5", "border-t", "border-separator", "bg-surface", "px-3", "pb-[max(0.75rem,env(safe-area-inset-bottom))]", "pt-2.5"),
    composerRow: cn("flex", "items-end", "gap-2", "rounded-[1.75rem]", "bg-default", "p-1.5", "pl-3"),
    textarea: cn("min-h-10", "max-h-28", "min-w-0", "flex-1", "resize-none", "border-0", "bg-transparent", "px-0", "py-2", "text-sm", "text-field-foreground", "outline-none", "placeholder:text-field-placeholder", "focus-visible:ring-0"),
    quota: cn("min-h-4", "px-2"),
} as const

/** Resolve a message bubble role without transferring visual ownership to the component. */
export const getAiChatBubbleClassName = (role: "user" | "assistant") => role === "user" ? aiChatClassNames.userBubble : aiChatClassNames.assistantBubble
