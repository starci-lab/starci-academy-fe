import { cn } from "@heroui/react"

/** Whole result workspace constrained to one readable evidence column. */
export const personalProjectResultClassName = cn("@container", "box-border", "mx-auto", "flex", "w-full", "max-w-[80rem]", "min-w-0", "flex-col", "gap-6", "px-4", "py-6", "@app-sm:px-6", "@app-lg:px-8", "@app-xl:py-8")
/** Result identity and return action stay grouped before grading evidence. */
export const personalProjectResultHeaderClassName = cn("flex", "max-w-4xl", "min-w-0", "flex-col", "items-start", "gap-3")
/** Native return destination keeps compact button affordance without losing href semantics. */
export const personalProjectResultBackLinkClassName = cn("inline-flex", "min-h-8", "items-center", "rounded-full", "bg-accent-soft", "px-3", "py-1.5", "text-sm", "font-medium", "text-accent-soft-foreground", "no-underline", "hover:bg-accent/15", "focus-visible:outline-2", "focus-visible:outline-offset-2", "focus-visible:outline-focus")
/** Score and feedback become peer evidence planes when enough width exists. */
export const personalProjectResultEvidenceClassName = cn("grid", "w-full", "min-w-0", "grid-cols-1", "items-start", "gap-5", "@app-lg:grid-cols-[7fr_13fr]")
/** Selected-attempt facts read as one compact verdict stack. */
export const personalProjectResultScoreClassName = cn("flex", "min-w-0", "flex-wrap", "items-center", "gap-x-3", "gap-y-2", "p-4", "@app-sm:p-5", "[&>*:last-child]:basis-full")
/** Structured findings retain scan rhythm and separators without nested cards. */
export const personalProjectResultFeedbackListClassName = cn("m-0", "flex", "min-w-0", "list-none", "flex-col", "p-0", "[&>li]:py-4", "[&>li+li]:border-t", "[&>li+li]:border-separator")
/** One finding groups message, location and corrective suggestion. */
export const personalProjectResultFeedbackItemClassName = cn("flex", "min-w-0", "items-start", "gap-3", "[&>div]:min-w-0", "[&>div]:flex-1")
/** Visible sequence markers make repeated findings easier to rank without inventing severity. */
export const personalProjectResultFeedbackOrdinalClassName = cn("flex", "size-8", "shrink-0", "items-center", "justify-center", "rounded-full", "bg-default-100", "text-xs", "font-semibold", "text-muted")
/** Queued, processing and recovery copy own a visible status surface. */
export const personalProjectResultStatusClassName = cn("flex", "min-h-24", "w-full", "min-w-0", "flex-col", "items-start", "justify-center", "gap-3", "p-4", "@app-sm:p-5")
/** Result destinations wrap predictably on compact canvases. */
export const personalProjectResultActionsClassName = cn("flex", "w-full", "min-w-0", "flex-wrap", "items-center", "gap-3", "border-t", "border-separator", "pt-5")
/** Native correction destination remains secondary to a passing next-task route. */
export const personalProjectResultActionLinkClassName = cn("inline-flex", "min-h-10", "items-center", "justify-center", "rounded-full", "bg-surface-secondary", "px-4", "py-2", "text-sm", "font-medium", "text-foreground", "no-underline", "hover:bg-accent-soft", "focus-visible:outline-2", "focus-visible:outline-offset-2", "focus-visible:outline-focus")
/** A passed attempt exposes one native primary continuation destination. */
export const personalProjectResultPrimaryLinkClassName = cn("inline-flex", "min-h-10", "items-center", "justify-center", "rounded-full", "bg-accent", "px-5", "py-2", "text-sm", "font-semibold", "text-accent-foreground", "no-underline", "hover:bg-accent-hover", "focus-visible:outline-2", "focus-visible:outline-offset-2", "focus-visible:outline-focus")
