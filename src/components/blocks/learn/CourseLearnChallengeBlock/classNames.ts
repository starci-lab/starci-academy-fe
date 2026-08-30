import { cn } from "@heroui/react"

/** Centers the complete challenge workbench and owns its responsive page inset. */
export const challengeWorkbenchClassName = cn("mx-auto", "flex", "w-full", "max-w-full", "min-w-0", "flex-col", "gap-6", "break-words", "px-6", "py-6", "lg:px-8", "2xl:h-[calc(100dvh-4rem)]", "2xl:max-w-7xl", "2xl:overflow-hidden")
/** Keeps course-map access and progress facts together without forcing a wide row. */
export const challengeToolbarClassName = cn("flex", "flex-wrap", "items-center", "justify-between", "gap-3")
/** Groups the challenge identity, facts, and language selector above the work planes. */
export const challengeHeaderClassName = cn("flex", "min-w-0", "flex-col", "gap-3", "border-b", "border-separator", "pb-6")
/** Wraps difficulty, status, and points as compact challenge facts. */
export const challengeMetaClassName = cn("flex", "flex-wrap", "items-center", "gap-2")
/** Keeps submission controls reachable without putting a tall form before the challenge brief. */
export const challengeSubmissionLauncherClassName = cn("w-full", "min-w-0", "max-w-full", "2xl:hidden")
/** Aligns challenge launcher copy and action inside one opaque Grammar-owned surface. */
export const challengeSubmissionLauncherContentClassName = cn("flex", "min-w-0", "flex-col", "items-stretch", "gap-4", "sm:flex-row", "sm:items-center", "sm:justify-between")
/** Groups the challenge launcher title and readiness fact. */
export const challengeSubmissionLauncherCopyClassName = cn("flex", "min-w-0", "flex-col", "gap-1")
/** Stacks grading first on small screens and forms the brief-plus-console desktop grid. */
export const challengeGridClassName = cn("grid", "w-full", "max-w-full", "min-w-0", "grid-cols-1", "items-start", "gap-6", "2xl:min-h-0", "2xl:flex-1", "2xl:grid-cols-3", "2xl:gap-8", "2xl:overflow-hidden")
/** Places the authored brief after grading on small screens and before it on desktop. */
export const challengeBriefColumnClassName = cn("mx-auto", "hidden", "w-full", "max-w-5xl", "min-w-0", "flex-col", "gap-6", "data-[active=true]:flex", "2xl:col-span-2", "2xl:h-full", "2xl:overflow-y-auto", "2xl:pr-2", "2xl:flex", "2xl:max-w-none")
/** Keeps the grading controls first on small screens and visible beside the brief on desktop. */
export const challengeConsoleClassName = cn("mx-auto", "hidden", "w-full", "max-w-2xl", "min-w-0", "flex-col", "items-center", "gap-5", "data-[active=true]:flex", "2xl:h-full", "2xl:overflow-y-auto", "2xl:pr-1", "2xl:flex", "2xl:max-w-none", "2xl:items-stretch")
/** Separates one evidence requirement from the next without nesting extra cards. */
export const challengeDeliverableClassName = cn("flex", "min-w-0", "flex-col", "gap-3", "border-b", "border-separator", "pb-5", "last:border-b-0", "last:pb-0")
/** Wraps secondary grading actions across narrow console widths. */
export const challengeActionsClassName = cn("flex", "flex-wrap", "gap-2")
/** Gives each authored guidance group a consistent readable rhythm. */
export const challengeGuidanceClassName = cn("flex", "min-w-0", "flex-col", "gap-4")
/** Frames a scored or instructional disclosure as one interactive row. */
export const challengeDisclosureClassName = cn("rounded-medium", "border", "border-separator", "p-3", "open:bg-default-50")
