import { cn } from "@heroui/react"

/** Adjustable rail separator. */
export const railDividerClassName = cn("group", "relative", "hidden", "w-2", "shrink-0", "cursor-col-resize", "self-stretch", "bg-background", "outline-none", "before:absolute", "before:left-0", "before:top-0", "before:h-full", "before:w-px", "before:bg-separator", "before:transition-colors", "hover:before:bg-accent", "focus-visible:before:bg-accent", "md:sticky", "md:top-16", "md:block", "md:h-app-rail")
/** Rail grab handle. */
export const railDividerHandleClassName = cn("pointer-events-none", "absolute", "left-1/2", "top-1/2", "h-10", "w-1", "-translate-x-1/2", "-translate-y-1/2", "rounded-full", "bg-muted/50", "transition-colors", "group-hover:bg-accent", "group-focus-visible:bg-accent")
