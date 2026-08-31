import { cn } from "@heroui/react"

/** Whole personal-project mission-control stack. */
export const coursePersonalProjectClassName = cn("@container", "box-border", "mx-auto", "flex", "w-full", "max-w-[96rem]", "min-w-0", "flex-col", "gap-6", "px-4", "py-6", "@app-sm:px-6", "@app-lg:px-8", "@app-xl:py-8")
/** Breadcrumb, title and summary stack. */
export const projectHeaderClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-3")
/** Product-owned hero: orientation and the next executable task share one decisive plane. */
export const projectHeroClassName = `${cn("grid", "min-w-0", "overflow-hidden", "rounded-3xl", "bg-accent-soft", "shadow-[var(--starci-core-surface-shadow)]")} @app-lg:grid-cols-[minmax(0,1fr)_18rem]`
/** Copy and next-task action become peer columns once the surface can support them. */
export const projectHeroContentClassName = `${cn("grid", "min-w-0", "grid-cols-1", "gap-5", "p-5", "@app-sm:p-6", "@app-md:items-center", "@app-md:gap-6")} @app-md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]`
/** Page identity is concise enough to leave the next task visually dominant. */
export const projectHeroIntroClassName = cn("max-w-2xl")
/** The next task is a distinct decision group, not a second card inside the hero. */
export const projectHeroTaskClassName = cn("flex", "max-w-2xl", "min-w-0", "flex-col", "items-start", "gap-2", "border-t", "border-accent/25", "pt-4", "@app-md:border-l", "@app-md:border-t-0", "@app-md:pl-6", "@app-md:pt-0", "[&_.button]:mt-1")
/** Supporting evidence stays attached to the task title. */
export const projectHeroTaskMetaClassName = cn("flex", "min-w-0", "flex-wrap", "items-center", "gap-2")
/** The generated journey image has a purposeful owner and stable responsive crop. */
export const projectHeroMediaClassName = cn("relative", "h-36", "overflow-hidden", "bg-accent/10", "@app-sm:h-40", "@app-lg:h-full", "@app-lg:min-h-56")
/** Crop around the delivery path and workstation, never around generated whitespace. */
export const projectHeroImageClassName = cn("h-full", "w-full", "object-cover", "object-[64%_52%]")
/** Main roadmap plane and supporting evidence rail. */
export const projectBodyClassName = cn("w-full", "min-w-0")
/** Reusable vertical rhythm inside either dashboard plane. */
export const projectStackClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-6")
/** The primary next-task decision inside its surface. */
export const projectNextTaskClassName = cn("flex", "w-full", "min-w-0", "flex-col", "items-start", "gap-3", "p-4", "[&_[data-slot=track]]:bg-accent/15")
/** RightRail owns px-3 py-6 and sticky lifecycle; this class owns only child composition. */
export const projectSidebarClassName = cn("grid", "w-full", "min-w-0", "grid-cols-1", "items-start", "gap-4", "@app-sm:grid-cols-2", "@app-lg:grid-cols-1")
/** Repository facts and its one external destination. */
export const projectRepositoryClassName = cn("flex", "min-h-20", "w-full", "min-w-0", "flex-col", "items-start", "justify-center", "gap-3", "p-4")
/** Roadmap identity and controls own a full row before the joined list frame. */
export const projectRoadmapHeaderClassName = cn("flex", "w-full", "min-w-0", "flex-col", "items-stretch", "gap-3", "@app-sm:flex-row", "@app-sm:items-center", "@app-sm:justify-between")
/** Roadmap count and search remain grouped as supporting controls. */
export const projectRoadmapControlsClassName = cn("flex", "w-full", "min-w-0", "flex-col", "items-stretch", "gap-2", "@app-sm:w-auto", "@app-sm:flex-row", "@app-sm:items-center", "@app-sm:justify-end", "@app-sm:gap-3", "[&>form]:min-w-0", "[&>form]:w-full", "@app-sm:[&>form]:w-72")
/** Use page flow on compact canvases; on wide layouts only the published Scroll branch owns roadmap overflow. */
export const projectRoadmapClassName = `${cn("flex", "min-w-0", "flex-col", "gap-3", "[--starci-core-contained-max-height:none]")} @app-lg:[--starci-core-contained-max-height:21.75rem]`
/** One joined list owns the separators between its milestone rows. */
export const projectRoadmapRowsClassName = cn("m-0", "list-none", "p-0", "[&>*+*]:border-t", "[&>*+*]:border-separator")
/** One roadmap row preserves identity, status, progress and destination order. */
export const projectMilestoneRowClassName = cn("flex", "min-h-[4.25rem]", "w-full", "min-w-0", "items-center", "gap-3", "py-3", "pl-4", "pr-20", "transition-colors", "hover:bg-accent/5", "data-[state=accent]:bg-accent/5", "@app-sm:pr-4")
/** The marker and title form one progression identity. */
export const projectMilestoneIdentityClassName = cn("flex", "min-w-0", "flex-1", "items-center", "gap-3")
/** Future positions stay neutral while preserving the order signal. */
export const projectMilestoneMarkerClassName = cn("flex", "size-8", "shrink-0", "items-center", "justify-center", "rounded-full", "border", "border-border", "bg-surface-secondary", "text-xs", "font-semibold", "text-foreground")
/** Completed positions carry the evidenced affirmative state. */
export const projectMilestoneMarkerCompleteClassName = cn("flex", "size-8", "shrink-0", "items-center", "justify-center", "rounded-full", "bg-success-soft", "text-success")
/** Title and state remain scannable as a pair. */
export const projectMilestoneTextClassName = cn("flex", "min-w-0", "flex-col", "gap-1", "break-words", "[overflow-wrap:anywhere]")
/** Three compact project facts read as one scan-friendly summary in the narrow evidence rail. */
export const projectMetricGridClassName = cn("flex", "w-full", "flex-col", "overflow-hidden", "rounded-2xl", "bg-surface-secondary")
/** Each fact keeps its label and value on one predictable comparison axis. */
export const projectMetricItemClassName = cn("flex", "min-w-0", "items-baseline", "justify-between", "gap-4", "px-4", "py-3", "text-left", "[&+&]:border-t", "[&+&]:border-separator")
/** Native task destinations share one page-owned action treatment without changing their link semantics. */
export const projectPrimaryActionLinkClassName = cn("group", "inline-flex", "min-h-10", "items-center", "justify-center", "gap-2", "rounded-full", "bg-accent", "px-5", "py-2", "text-sm", "font-semibold", "text-accent-foreground", "no-underline", "transition-colors", "hover:bg-accent-hover", "focus-visible:outline-2", "focus-visible:outline-offset-2", "focus-visible:outline-focus")
/** The repository continuation stays subordinate to the hero's one primary action. */
export const projectSecondaryActionLinkClassName = cn("group", "inline-flex", "min-h-9", "items-center", "justify-center", "gap-2", "rounded-full", "bg-accent-soft", "px-4", "py-2", "text-sm", "font-medium", "text-accent-soft-foreground", "no-underline", "transition-colors", "hover:bg-accent/15", "focus-visible:outline-2", "focus-visible:outline-offset-2", "focus-visible:outline-focus")
/** Direction glyph answers hover on the complete destination. */
export const projectActionGlyphClassName = cn("transition-transform", "duration-200", "ease-out", "group-hover:translate-x-1", "motion-reduce:transition-none", "motion-reduce:group-hover:translate-x-0")
