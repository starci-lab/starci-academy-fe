import { cn } from "@heroui/react"

/** Code block container. */
export const codeBlockClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-2", "rounded-medium", "bg-surface", "p-4")
/** Code language label. */
export const codeBlockLanguageClassName = cn("text-xs", "leading-4", "text-muted")
/** Code preformatted content. */
export const codeBlockPreClassName = cn("w-full", "min-w-0", "overflow-x-auto", "whitespace-pre-wrap", "break-words", "font-mono", "text-sm", "leading-5", "text-foreground")
