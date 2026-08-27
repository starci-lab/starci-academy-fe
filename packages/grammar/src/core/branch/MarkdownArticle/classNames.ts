import { cn } from "@heroui/react"

/** Identifies the readable Markdown document frame. */
export const markdownArticleClassName = cn("min-w-0", "w-full")
/** Identifies a bounded fenced-code frame. */
export const fencedCodeBlockClassName = cn("min-w-0", "overflow-auto")
/** Identifies the optional fenced-code header. */
export const fencedCodeHeaderClassName = cn("flex", "items-center", "justify-between")
/** Identifies the bounded table overflow frame. */
export const markdownTableFrameClassName = cn("min-w-0", "overflow-auto")
