import { cn } from "@heroui/react"

/** Side-panel and compact sessions flow with the page; full desktop supplies the bounded height. */
export const mockInterviewSessionPageClassName = cn("flex", "min-h-0", "w-full", "min-w-0", "flex-col", "overflow-visible", "lg:h-[calc(100dvh-6.875rem)]", "lg:min-h-[36rem]", "lg:overflow-hidden")
/** Route context stays outside the interview's scroll owners. */
export const mockInterviewSessionBreadcrumbClassName = cn("min-w-0", "shrink-0", "border-b", "border-separator", "bg-background", "px-4", "py-2", "sm:px-6")
/** The connected room follows side-panel document flow and consumes the bounded full-desktop remainder. */
export const mockInterviewSessionBodyClassName = cn("min-w-0", "flex-1", "overflow-visible", "lg:min-h-0", "lg:overflow-hidden")
