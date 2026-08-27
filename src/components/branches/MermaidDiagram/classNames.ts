import { cn } from "@heroui/react"

/** Failed diagram source remains readable in a horizontally scrollable code frame. */
export const mermaidFailureClassName = cn("w-full", "min-w-0", "overflow-x-auto", "rounded-xl", "border", "border-border", "bg-background", "shadow-none", "p-4", "font-mono", "text-sm")
/** Diagram frame preserves the bordered figure anatomy. */
export const mermaidFigureClassName = cn("w-full", "min-w-0", "overflow-hidden", "rounded-xl", "border", "border-border", "bg-background", "shadow-none")
/** Diagram header separates language metadata from rendered content. */
export const mermaidHeaderClassName = cn("flex", "items-center", "justify-between", "border-b", "border-separator", "px-3", "py-2")
/** Language label uses compact monospace supporting copy. */
export const mermaidLanguageClassName = cn("font-mono", "text-xs", "text-muted")
/** Rendered SVG viewport scrolls without constraining the source diagram. */
export const mermaidSvgViewportClassName = cn("min-w-0", "overflow-x-auto", "p-3", "[&>svg]:h-auto", "[&>svg]:!w-auto", "[&>svg]:!max-w-none")
/** Caption provides centered supporting copy beneath the figure. */
export const mermaidCaptionClassName = cn("px-3", "pb-3", "text-center", "text-sm", "italic", "text-muted")
/** Full-screen expanded diagram dialog. */
export const mermaidDialogClassName = cn("fixed", "inset-0", "z-50", "flex", "flex-col", "bg-background", "p-6")
/** Expanded dialog close action. */
export const mermaidCloseClassName = cn("self-end", "rounded-full", "bg-default", "px-3", "py-2")
/** Expanded SVG viewport centers the diagram while allowing overflow. */
export const mermaidExpandedViewportClassName = cn("flex", "min-h-0", "flex-1", "items-center", "justify-center", "overflow-auto")
/** Expanded SVG fills the available dialog width. */
export const mermaidExpandedSvgClassName = cn("w-full", "[&>svg]:h-auto", "[&>svg]:w-full", "[&>svg]:max-w-full")
/** Expanded caption remains centered below the diagram. */
export const mermaidExpandedCaptionClassName = cn("text-center", "text-sm", "italic", "text-muted")
/** Placeholder shown while Mermaid renders asynchronously. */
export const mermaidLoadingClassName = cn("block", "h-48", "w-full", "animate-pulse", "bg-default")
