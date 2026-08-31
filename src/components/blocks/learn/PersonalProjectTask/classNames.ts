import { cn } from "@heroui/react"

/** Centers the complete personal-project task and owns its responsive page inset. */
export const personalProjectTaskClassName = cn("mx-auto", "flex", "w-full", "max-w-full", "min-w-0", "flex-col", "gap-6", "break-words", "px-6", "py-6", "lg:px-8", "2xl:h-[calc(100dvh-4rem)]", "2xl:max-w-7xl", "2xl:overflow-hidden")
/** Groups the task identity and facts above the brief and grading console. */
export const personalProjectTaskHeaderClassName = cn("flex", "min-w-0", "flex-col", "gap-3", "border-b", "border-separator", "pb-6")
/** Wraps difficulty and maximum score as compact task facts. */
export const personalProjectTaskMetaClassName = cn("flex", "flex-wrap", "items-center", "gap-2")
/** Keeps grading one tap away without displacing the task brief on constrained workspaces. */
export const personalProjectTaskLauncherClassName = cn("w-full", "min-w-0", "max-w-full", "2xl:hidden")
/** Aligns launcher copy and action inside one opaque Grammar-owned surface. */
export const personalProjectTaskLauncherContentClassName = cn("flex", "min-w-0", "flex-col", "items-stretch", "gap-4", "sm:flex-row", "sm:items-center", "sm:justify-between")
/** Groups the launcher title and current branch as one compact copy block. */
export const personalProjectTaskLauncherCopyClassName = cn("flex", "min-w-0", "flex-col", "gap-1")
/** Stacks grading first on small screens and forms the brief-plus-console desktop grid. */
export const personalProjectTaskGridClassName = cn("grid", "w-full", "max-w-full", "min-w-0", "grid-cols-1", "items-start", "gap-6", "2xl:min-h-0", "2xl:flex-1", "2xl:grid-cols-7", "2xl:gap-8", "2xl:overflow-hidden")
/** Places the long authored brief after grading on small screens and before it on desktop. */
export const personalProjectTaskBriefClassName = cn("hidden", "w-full", "max-w-full", "min-w-0", "flex-col", "gap-6", "data-[active=true]:flex", "2xl:col-span-4", "2xl:flex", "2xl:h-full", "2xl:overflow-y-auto", "2xl:pr-2")
/** Keeps the three-step grading console first on small screens and gives it one explicit desktop scroll owner. */
export const personalProjectTaskConsoleClassName = cn("mx-auto", "hidden", "w-full", "max-w-2xl", "min-w-0", "flex-col", "items-center", "data-[active=true]:flex", "2xl:col-span-3", "2xl:flex", "2xl:h-full", "2xl:max-w-none", "2xl:items-stretch", "2xl:overflow-y-auto", "2xl:pr-1")
/** Stacks source, analysis, and review steps inside the console. */
export const personalProjectTaskConsoleBodyClassName = cn("flex", "w-full", "max-w-full", "min-w-0", "flex-col", "gap-5")
/** Aligns one numbered grading step with its content. */
export const personalProjectTaskStepClassName = cn("flex", "min-w-0", "items-start", "gap-3")
/** Draws the compact numeric marker for one grading step. */
export const personalProjectTaskStepNumberClassName = cn("flex", "size-7", "shrink-0", "items-center", "justify-center", "rounded-full", "bg-default-100", "text-xs", "font-semibold", "text-foreground")
/** Stacks the labels, guidance, inputs, and actions belonging to one grading step. */
export const personalProjectTaskStepBodyClassName = cn("flex", "min-w-0", "flex-1", "flex-col", "gap-2")
/** Preserve a visible continuation cue for long repository values on narrow canvases. */
export const personalProjectTaskRepositoryFieldClassName = cn("min-w-0", "[&_input]:text-ellipsis")
/** Wraps history and feedback actions without forcing overflow. */
export const personalProjectTaskActionClassName = cn("flex", "flex-wrap", "gap-2", "pt-1")
/** Separates the latest immutable result from the current review action. */
export const personalProjectTaskLatestClassName = cn("flex", "flex-col", "gap-2", "rounded-medium", "bg-default-50", "p-3")
/** Gives authored peer-list bodies the same internal inset as every other bounded brief surface. */
export const personalProjectTaskPeerItemClassName = cn("min-w-0", "p-4", "[&+&]:border-t", "[&+&]:border-separator")
/** Ends compact authored guidance with one explicit handoff into the grading workflow. */
export const personalProjectTaskTerminalClassName = cn("flex", "w-full", "justify-end", "border-t", "border-separator", "pt-5", "2xl:hidden")
