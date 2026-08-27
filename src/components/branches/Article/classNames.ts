import { cn } from "@heroui/react"
/** Article stack layout. */
export const articleStackClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-3")
/** Article tab list layout. */
export const articleTabsClassName = cn("flex", "w-fit", "gap-1", "rounded-full", "bg-default", "p-1")
/** Article tab control. */
export const articleTabClassName = cn("rounded-full", "px-3", "py-2", "aria-selected:bg-surface")
/** Article preview frame. */
export const articlePreviewClassName = cn("rounded-medium", "border", "border-separator", "p-3")
/** Article heading anchor group. */
export const articleHeadingClassName = cn("group", "scroll-mt-20")
/** Article heading permalink. */
export const articleAnchorClassName = cn("ml-2", "text-muted", "opacity-0", "group-hover:opacity-100")
/** Article image. */
export const articleImageClassName = cn("h-auto", "w-full", "rounded-2xl")
/** Article figure. */
export const articleFigureClassName = cn("w-full")
/** Article caption. */
export const articleCaptionClassName = cn("mt-2", "text-center", "text-sm", "italic", "text-muted")
/** Article details disclosure. */
export const articleDetailsClassName = cn("group", "rounded-medium", "border", "border-separator", "bg-surface")
/** Article disclosure summary. */
export const articleSummaryClassName = cn("cursor-pointer", "list-none", "px-4", "py-3", "font-medium")
/** Article disclosure body. */
export const articleDetailsBodyClassName = cn("flex", "flex-col", "gap-4", "border-t", "border-separator", "p-4")
/** Article block column. */
export const articleColumnClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-2")
/** Muted article block. */
export const articleMutedClassName = cn("text-sm", "font-semibold", "text-muted", "[&_*]:text-muted")
/** Article tag run. */
export const articleTagRunClassName = cn("my-2", "flex", "flex-wrap", "gap-3")
/** Compact article block column. */
export const articleCompactColumnClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-4")
/** Muted inline article text. */
export const articleMutedInlineClassName = cn("text-sm", "font-semibold", "text-muted")
/** Article loading line. */
export const articleRestingLineClassName = cn("h-6", "select-none", "rounded", "bg-default", "text-transparent", "animate-pulse")
/** Article loading line with its measured width. */
export const getArticleRestingLineClassName = (width: "w-3/4" | "w-full" | "w-5/6" | "w-2/3") => cn(articleRestingLineClassName, width)
