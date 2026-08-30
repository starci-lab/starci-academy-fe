import { cn } from "@heroui/react"

/** Whole personal-project mission-control stack. */
export const coursePersonalProjectClassName = cn("@container", "box-border", "mx-auto", "flex", "w-full", "max-w-[96rem]", "min-w-0", "flex-col", "gap-7", "px-4", "py-6", "sm:px-6", "lg:px-8", "lg:py-8")
/** Breadcrumb, title and summary stack. */
export const projectHeaderClassName = cn("flex", "w-full", "max-w-3xl", "min-w-0", "flex-col", "gap-3")
/** Main roadmap plane and supporting evidence rail. */
export const projectBodyClassName = `${cn("grid", "w-full", "min-w-0", "grid-cols-1", "items-start", "gap-7", "@app-lg:items-start")} @app-lg:grid-cols-[minmax(0,1fr)_20rem]`
/** Reusable vertical rhythm inside either dashboard plane. */
export const projectStackClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-7")
/** The primary next-task decision inside its surface. */
export const projectNextTaskClassName = cn("flex", "w-full", "min-w-0", "flex-col", "items-start", "gap-4", "rounded-xl", "bg-accent-soft/50", "p-1")
/** Current milestone and its grading evidence stay on one subordinate line. */
export const projectCurrentTaskHeaderClassName = cn("flex", "w-full", "min-w-0", "flex-wrap", "items-center", "justify-between", "gap-3")
/** Whole native destination rendered as the singular primary action. */
export const projectCurrentTaskLinkClassName = cn("flex", "min-h-11", "w-full", "items-center", "justify-between", "gap-3", "rounded-full", "bg-accent", "px-5", "py-2.5", "font-semibold", "text-accent-foreground", "shadow-sm", "transition-opacity", "hover:opacity-90", "focus-visible:outline-2", "focus-visible:outline-offset-2", "focus-visible:outline-focus")
/** Keep the action label readable when it wraps in compact layouts. */
export const projectCurrentTaskLinkCopyClassName = cn("min-w-0", "grow", "text-left")
/** Progress and repository surfaces stay together without becoming sticky chrome. */
export const projectSidebarClassName = cn("grid", "w-full", "min-w-0", "grid-cols-1", "items-start", "gap-6", "@app-sm:grid-cols-2", "@app-lg:grid-cols-1")
/** Repository facts and its one external destination. */
export const projectRepositoryClassName = cn("flex", "w-full", "min-w-0", "flex-col", "items-start", "gap-4")
/** Aggregate facts form one compact evidence group without another nested card. */
export const projectCompletionFactsClassName = cn("overflow-hidden", "rounded-xl", "border", "border-separator", "[&>*+*]:border-t", "[&>*+*]:border-separator")
/** Roadmap count and search remain outside the joined list frame. */
export const projectRoadmapControlsClassName = cn("flex", "w-full", "min-w-0", "flex-row", "items-center", "justify-between", "gap-3", "sm:w-auto", "sm:justify-end", "[&>form]:min-w-0", "[&>form]:w-full", "sm:[&>form]:w-72")
/** Bound the project path so the evidence rail stays discoverable on one screen. */
export const projectRoadmapClassName = cn("[--starci-core-contained-max-height:38rem]")
/** One joined list owns the separators between its milestone rows. */
export const projectRoadmapRowsClassName = cn("[&>*+*]:border-t", "[&>*+*]:border-separator")
/** One roadmap row with state, progress, and optional native destination. */
export const projectMilestoneClassName = (tone: "neutral" | "accent" | "success" = "neutral") => cn(
    "flex", "w-full", "min-w-0", "items-center", "gap-4", "px-4", "py-4",
    tone === "accent" && "bg-accent-soft/45",
    tone === "success" && "bg-success-soft/30",
)
/** Stable stage number supports scanning without outranking the stage title. */
export const projectMilestoneNumberClassName = cn("w-7", "shrink-0", "text-xs", "font-semibold", "tabular-nums", "text-muted")
/** Milestone title, state, and progress presentation. */
export const projectMilestoneIdentityClassName = cn("flex", "min-w-0", "grow", "flex-col", "gap-2")
/** State copy and compact completion fact remain subordinate to the title. */
export const projectMilestoneMetaClassName = cn("flex", "min-w-0", "items-center", "justify-between", "gap-3")
/** Short progress seam preserves explicit stage completion meaning. */
export const projectMilestoneProgressClassName = cn("w-full", "max-w-md")
