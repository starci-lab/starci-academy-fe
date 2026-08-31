import { cn } from "@heroui/react"

/** Page-local live session frame. */
export const playgroundSessionClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-4", "px-4", "py-5", "sm:gap-6", "sm:px-6", "sm:py-8", "lg:px-8", "xl:px-10")
/** Session identity and progress card content. */
export const playgroundIdentityClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-4", "p-4", "sm:p-5")
/** Session identity and connection row. */
export const playgroundIdentityTopClassName = cn("flex", "min-w-0", "flex-col", "gap-3", "md:flex-row", "md:items-start", "md:justify-between")
/** Session icon and title group. */
export const playgroundIdentityCopyClassName = cn("flex", "min-w-0", "items-start", "gap-3")
/** Session identity icon frame. */
export const playgroundIdentityIconClassName = cn("flex", "size-10", "shrink-0", "items-center", "justify-center", "rounded-xl", "bg-accent-soft", "text-accent-soft-foreground")
/** Neutral connection state chip. */
export const playgroundConnectionClassName = cn("inline-flex", "w-fit", "items-center", "gap-2", "rounded-full", "border", "border-divider", "bg-content2", "px-3", "py-2")
/** Connected state chip. */
export const playgroundConnectionLiveClassName = cn(playgroundConnectionClassName, "border-success/30", "bg-success-soft", "text-success-soft-foreground")
/** Reconnecting or failed state chip. */
export const playgroundConnectionProblemClassName = cn(playgroundConnectionClassName, "border-warning/30", "bg-warning-soft", "text-warning-soft-foreground")
/** Select the semantic connection chip without constructing styles in the component. */
export const playgroundConnectionStateClassName = (state: "live" | "problem" | "neutral") => state === "live"
    ? playgroundConnectionLiveClassName
    : state === "problem"
        ? playgroundConnectionProblemClassName
        : playgroundConnectionClassName
/** Verified progress group. */
export const playgroundProgressClassName = cn("flex", "min-w-0", "flex-col", "gap-2")
/** Verified progress label and fraction. */
export const playgroundProgressCopyClassName = cn("flex", "items-center", "justify-between", "gap-4")
/** Bounded horizontal outline avoids a desktop-only three-pane rail. */
export const playgroundStepRailClassName = cn("flex", "w-full", "min-w-0", "gap-2", "overflow-x-auto", "p-1", "pb-2")
/** Available or locked step button. */
export const playgroundStepButtonClassName = cn("flex", "min-h-11", "min-w-[11rem]", "max-w-64", "cursor-pointer", "items-center", "gap-3", "rounded-xl", "border", "border-divider", "bg-content1", "px-3", "py-2", "text-start", "transition-colors", "duration-200", "hover:border-accent/35", "focus-visible:outline-2", "focus-visible:outline-offset-2", "focus-visible:outline-accent", "disabled:cursor-not-allowed", "disabled:opacity-45")
/** Current step button. */
export const playgroundStepButtonCurrentClassName = cn(playgroundStepButtonClassName, "border-accent/45", "bg-accent-soft")
/** Step ordinal frame. */
export const playgroundStepNumberClassName = cn("flex", "size-8", "shrink-0", "items-center", "justify-center", "rounded-lg", "bg-content2", "text-xs", "font-semibold")
/** Step title and status stack. */
export const playgroundStepCopyClassName = cn("flex", "min-w-0", "flex-col", "gap-0.5")
/** Supported primary-secondary grid: task/workbench plus status/activity. */
export const playgroundSplitClassName = cn("grid", "w-full", "min-w-0", "grid-cols-1", "items-start", "gap-4", "xl:grid-cols-[3fr_1fr]")
/** Instruction and workbench card content. */
export const playgroundTaskClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-5", "p-5", "sm:p-6")
/** Current task heading. */
export const playgroundTaskHeaderClassName = cn("flex", "min-w-0", "flex-col", "gap-2", "border-b", "border-divider", "pb-4")
/** Current task action hint. */
export const playgroundHintClassName = cn("rounded-xl", "border", "border-accent/15", "bg-accent-soft/60", "p-4")
/** Command scratchpad group. */
export const playgroundWorkbenchClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-4", "border-t", "border-divider", "pt-5")
/** Verify and exit actions. */
export const playgroundVerifyActionClassName = cn("flex", "flex-wrap", "items-center", "gap-3", "scroll-mt-24", "scroll-mb-8")
/** Session activity card content. */
export const playgroundActivityClassName = cn("flex", "max-h-[36rem]", "min-w-0", "flex-col", "gap-4", "p-5", "sm:p-6")
/** Activity card heading and recovery. */
export const playgroundActivityHeaderClassName = cn("flex", "min-w-0", "flex-col", "gap-3", "border-b", "border-divider", "pb-4")
/** Scrollable verified activity list. */
export const playgroundActivityListClassName = cn("flex", "min-w-0", "flex-col", "gap-2", "overflow-y-auto")
/** One verified activity event. */
export const playgroundActivityRowClassName = cn("flex", "items-start", "gap-3", "rounded-xl", "bg-content2/60", "p-3")
/** Completed or failed result content. */
export const playgroundSettledClassName = cn("flex", "min-w-0", "flex-col", "items-start", "gap-5", "p-6", "sm:p-8")
/** Completed result icon. */
export const playgroundSettledIconClassName = cn("flex", "size-12", "items-center", "justify-center", "rounded-2xl", "bg-success-soft", "text-success-soft-foreground")
/** Failed result icon. */
export const playgroundSettledProblemIconClassName = cn(playgroundSettledIconClassName, "bg-warning-soft", "text-warning-soft-foreground")
/** Result recovery and exit actions. */
export const playgroundSettledActionsClassName = cn("flex", "flex-wrap", "gap-3")
