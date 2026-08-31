import { cn } from "@heroui/react"

/** Page-local setup frame. */
export const playgroundSetupClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-6", "px-4", "py-5", "sm:gap-8", "sm:px-6", "sm:py-8", "lg:px-8", "xl:px-10")
/** Setup heading stack. */
export const playgroundSetupHeaderClassName = cn("flex", "max-w-4xl", "min-w-0", "flex-col", "gap-3")
/** Catalog return action owner. */
export const playgroundSetupBackClassName = cn("mb-1", "flex", "w-fit")
/** Setup Playground identity row. */
export const playgroundSetupIdentityClassName = cn("flex", "min-w-0", "items-start", "gap-3")
/** Setup identity icon frame. */
export const playgroundSetupIdentityIconClassName = cn("flex", "size-11", "shrink-0", "items-center", "justify-center", "rounded-xl", "bg-accent-soft", "text-accent-soft-foreground")
/** Truthful Create -> Pair -> Enter stage strip, not a guessed percentage. */
export const playgroundSetupStagesClassName = cn("grid", "grid-cols-1", "gap-2", "sm:grid-cols-3")
/** Upcoming setup stage. */
export const playgroundSetupStageClassName = cn("flex", "min-w-0", "items-center", "gap-3", "rounded-xl", "border", "border-divider", "bg-content1", "px-4", "py-3")
/** Current setup stage. */
export const playgroundSetupStageCurrentClassName = cn(playgroundSetupStageClassName, "border-accent/40", "bg-accent-soft")
/** Completed setup stage. */
export const playgroundSetupStageCompleteClassName = cn(playgroundSetupStageClassName, "border-success/30", "bg-success-soft")
/** Preparation and pairing grid. */
export const playgroundSetupGridClassName = cn("grid", "w-full", "min-w-0", "grid-cols-1", "items-start", "gap-4", "xl:grid-cols-[1.05fr_0.95fr]")
/** Preparation checklist card content. */
export const playgroundPreparationClassName = cn("flex", "flex-col", "gap-5", "p-5", "sm:p-6")
/** One preparation instruction. */
export const playgroundPreparationStepClassName = cn("flex", "items-start", "gap-4", "rounded-xl", "bg-content2/60", "p-3")
/** Session creation and pairing card content. */
export const playgroundPairingClassName = cn("flex", "min-w-0", "flex-col", "gap-5", "p-5", "sm:p-6")
/** Pairing card identity row. */
export const playgroundPairingHeaderClassName = cn("flex", "min-w-0", "items-start", "gap-3")
/** Pairing code group. */
export const playgroundPairingCodeClassName = cn("flex", "min-w-0", "flex-col", "gap-3", "rounded-xl", "border", "border-divider", "bg-content2", "p-4")
/** Copy-safe pairing code value. */
export const playgroundPairingCodeValueClassName = cn("min-w-0", "break-all", "font-mono", "text-sm", "font-semibold", "tracking-[0.08em]")
/** Live setup status notice. */
export const playgroundStatusClassName = cn("flex", "min-w-0", "items-start", "gap-3", "rounded-xl", "border", "border-divider", "bg-content2/60", "p-4")
/** Setup action group. */
export const playgroundActionsClassName = cn("flex", "flex-wrap", "items-center", "gap-3")
/** Setup error or not-found notice. */
export const playgroundNoticeClassName = cn("flex", "flex-col", "gap-5", "p-5", "sm:p-6")
