import { cn } from "@heroui/react"

/** Result page document column. */
export const challengeResultDocumentClassName = cn("mx-auto", "flex", "w-full", "max-w-6xl", "min-w-0", "flex-col", "gap-6", "px-4", "py-6")
/** Pending or unavailable evaluation panel. */
export const challengeEvaluationClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-3", "rounded-xl", "border", "border-separator", "p-4")
/** Full result workspace stack. */
export const challengeResultWorkspaceClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-6")
/** Outcome summary stack. */
export const challengeResultSummaryClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-3")
/** Centred title and description. */
export const titlePairClassName = cn("flex", "flex-col", "gap-3", "items-center", "text-center")
/** Peer controls sharing one width. */
export const stackedControlsClassName = cn("flex", "flex-col", "gap-4", "[&>*]:w-full")
/** Joined criterion feedback list. */
export const challengeFeedbackClassName = cn("flex", "w-full", "min-w-0", "flex-col", "divide-y", "divide-separator")
/** One criterion's evidence stack. */
export const challengeFeedbackItemClassName = cn("flex", "flex-col", "gap-4", "py-3", "[&>*]:w-full")
/** Sticky settled-result actions. */
export const challengeResultActionsClassName = cn("sticky", "bottom-0", "z-40", "flex", "w-full", "min-w-0", "flex-col", "gap-2", "border-t", "border-separator", "bg-background", "py-3", "pl-4", "pr-32", "sm:flex-row", "sm:flex-wrap", "sm:items-center", "sm:justify-end")
