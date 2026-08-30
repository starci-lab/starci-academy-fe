import { cn } from "@heroui/react"

/** Quiz setup workspace with one page inset and no desktop minimum width. */
export const quizWorkspaceClassName = cn("mx-auto", "flex", "w-full", "max-w-6xl", "min-w-0", "flex-col", "gap-6", "break-words", "px-4", "py-6", "sm:px-6", "lg:px-8")
/** Page identity and scored-mode consequence. */
export const quizHeaderClassName = cn("flex", "min-w-0", "flex-col", "gap-2", "border-b", "border-separator", "pb-5")
/** One return route and one peer tab set; the two hierarchy levels never share a selected underline. */
export const quizNavClassName = cn("flex", "min-w-0", "flex-col", "gap-3", "border-b", "border-separator", "pb-3", "sm:flex-row", "sm:items-end", "sm:justify-between")
/** Only setup/history/stats are peer tabs inside Quick quiz. */
export const quizViewTabsClassName = cn("flex", "min-w-0", "flex-wrap", "gap-5")
/** Keeps resumable work visible ahead of a new setup. */
export const quizResumeClassName = cn("flex", "min-w-0", "flex-col", "items-stretch", "gap-4", "p-4", "sm:flex-row", "sm:items-center", "sm:justify-between")
/** Treat resume, setup and its explanation as one continuous workbench. */
export const quizSetupRegionClassName = cn("flex", "min-w-0", "flex-col", "gap-6")
/** Setup form and eligibility owner split only when enough width exists. */
export const quizSetupGridClassName = cn("grid", "min-w-0", "grid-cols-1", "items-start", "gap-6", "lg:grid-cols-[1fr_20rem]")
/** Explains the scored-session lifecycle without manufacturing empty viewport space. */
export const quizWorkflowClassName = cn("m-0", "grid", "min-w-0", "list-none", "grid-cols-1", "gap-3", "p-4", "sm:grid-cols-3", "sm:p-5")
/** One short lifecycle step with an explicit sequence marker. */
export const quizWorkflowStepClassName = cn("flex", "min-w-0", "flex-col", "gap-2", "rounded-medium", "bg-default-50", "p-4")
/** Compact configuration rhythm inside one SurfaceCard. */
export const quizFormClassName = cn("flex", "min-w-0", "flex-col", "gap-5", "p-5")
/** One configuration field group. */
export const quizFieldGroupClassName = cn("flex", "min-w-0", "flex-col", "gap-2")
/** Native actions wrap instead of shrinking below useful labels. */
export const quizChoiceRowClassName = cn("flex", "min-w-0", "flex-wrap", "gap-2")
/** Eligibility preflight owns its status, reason, and dominant Start action. */
export const quizPreflightClassName = cn("flex", "min-w-0", "flex-col", "gap-4", "p-5", "lg:sticky", "lg:top-6")
/** Visible preflight status treatment. */
export const quizPreflightStatusClassName = cn("flex", "min-w-0", "flex-col", "gap-2", "rounded-medium", "bg-default-50", "p-4")
/** Stable owner for empty, unavailable, and transport recovery. */
export const quizStateClassName = cn("flex", "min-h-40", "min-w-0", "flex-col", "items-start", "justify-center", "gap-3", "p-5", "sm:p-6")
/** Joined history/stat rows. */
export const quizEvidenceListClassName = cn("m-0", "flex", "min-w-0", "list-none", "flex-col", "divide-y", "divide-separator", "p-0")
/** One comparable history row; wider screens align the session facts for scanning. */
export const quizEvidenceRowClassName = cn("grid", "min-w-0", "gap-1", "p-4", "sm:grid-cols-[1fr_auto_auto]", "sm:items-center", "sm:gap-5")
/** Statistics become compact comparable cards instead of an unbounded vertical ledger. */
export const quizStatsGridClassName = cn("m-0", "grid", "min-w-0", "list-none", "grid-cols-2", "gap-3", "p-3", "lg:grid-cols-3")
/** One topic accuracy card with visible card affordance and balanced density. */
export const quizStatsRowClassName = cn("flex", "min-w-0", "flex-col", "gap-1", "rounded-medium", "border", "border-separator", "bg-default-50", "p-4")
/** Coverage summary owns the first full row before topic comparisons. */
export const quizStatsPrimaryCardClassName = cn(quizStatsRowClassName, "col-span-2", "lg:col-span-3")
/** Recovery actions remain visible and wrap safely. */
export const quizActionRowClassName = cn("flex", "min-w-0", "flex-wrap", "gap-2")
