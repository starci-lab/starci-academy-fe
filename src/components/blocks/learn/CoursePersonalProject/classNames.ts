import { cn } from "@heroui/react"

/** Whole personal-project mission-control stack. */
export const coursePersonalProjectClassName = cn("@container", "box-border", "mx-auto", "flex", "w-full", "max-w-[96rem]", "min-w-0", "flex-col", "gap-6", "px-4", "py-6", "sm:px-6", "lg:px-8", "2xl:py-8")
/** Breadcrumb, title and summary stack. */
export const projectHeaderClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-3")
/** Product-owned hero: orientation and the next executable task share one decisive plane. */
export const projectHeroClassName = `${cn("grid", "min-w-0", "overflow-hidden", "rounded-3xl", "bg-accent-soft", "shadow-[var(--dashboard-calm-elevation)]")} @app-lg:grid-cols-[minmax(0,1fr)_18rem]`
/** Copy and next-task action become peer columns once the surface can support them. */
export const projectHeroContentClassName = `${cn("grid", "min-w-0", "grid-cols-1", "gap-5", "p-5", "sm:p-6", "@app-md:items-center", "@app-md:gap-6")} @app-md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]`
/** Page identity is concise enough to leave the next task visually dominant. */
export const projectHeroCopyClassName = cn("flex", "max-w-2xl", "min-w-0", "flex-col", "items-start", "gap-2")
/** The next task is a distinct decision group, not a second card inside the hero. */
export const projectHeroTaskClassName = cn("flex", "max-w-2xl", "min-w-0", "flex-col", "items-start", "gap-2", "border-t", "border-accent/25", "pt-4", "@app-md:border-l", "@app-md:border-t-0", "@app-md:pl-6", "@app-md:pt-0", "[&_.button]:mt-1")
/** Supporting evidence stays attached to the task title. */
export const projectHeroTaskMetaClassName = cn("flex", "min-w-0", "flex-wrap", "items-center", "gap-2")
/** The generated journey image has a purposeful owner and stable responsive crop. */
export const projectHeroMediaClassName = cn("relative", "h-36", "overflow-hidden", "bg-accent/10", "sm:h-40", "@app-lg:h-full", "@app-lg:min-h-56")
/** Crop around the delivery path and workstation, never around generated whitespace. */
export const projectHeroImageClassName = cn("h-full", "w-full", "object-cover", "object-[64%_52%]")
/** Main roadmap plane and supporting evidence rail. */
export const projectBodyClassName = `${cn("grid", "w-full", "min-w-0", "grid-cols-1", "items-start", "gap-6", "@app-lg:items-start")} @app-lg:grid-cols-[minmax(0,1fr)_21rem]`
/** Reusable vertical rhythm inside either dashboard plane. */
export const projectStackClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-6")
/** The primary next-task decision inside its surface. */
export const projectNextTaskClassName = cn("flex", "w-full", "min-w-0", "flex-col", "items-start", "gap-3", "[&_[data-slot=track]]:bg-accent/15")
/** Progress and repository surfaces stay together without becoming sticky chrome. */
export const projectSidebarClassName = cn("grid", "w-full", "min-w-0", "grid-cols-1", "items-start", "gap-6", "@app-sm:grid-cols-2", "@app-lg:sticky", "@app-lg:top-22", "@app-lg:grid-cols-1")
/** Repository facts and its one external destination. */
export const projectRepositoryClassName = cn("flex", "min-h-24", "w-full", "min-w-0", "flex-col", "items-start", "justify-center", "gap-4", "rounded-2xl", "bg-surface-secondary", "p-4")
/** Roadmap identity and controls own a full row before the joined list frame. */
export const projectRoadmapHeaderClassName = cn("flex", "w-full", "min-w-0", "flex-col", "items-stretch", "gap-3", "sm:flex-row", "sm:items-center", "sm:justify-between")
/** Roadmap count and search remain grouped as supporting controls. */
export const projectRoadmapControlsClassName = cn("flex", "w-full", "min-w-0", "flex-col", "items-stretch", "gap-2", "sm:w-auto", "sm:flex-row", "sm:items-center", "sm:justify-end", "sm:gap-3", "[&>form]:min-w-0", "[&>form]:w-full", "sm:[&>form]:w-72")
/** Use page scroll on compact canvases; only wide mission-control layouts own a contained roadmap scroll. */
export const projectRoadmapClassName = `${cn("flex", "min-w-0", "flex-col", "gap-3", "[--starci-core-contained-max-height:none]", "[&_[data-grammar-list=true]]:overflow-visible", "[&_[data-grammar-scroll=contained]]:overflow-visible")} @app-lg:[--starci-core-contained-max-height:36rem] @app-lg:[&_[data-grammar-list=true]]:overflow-auto @app-lg:[&_[data-grammar-scroll=contained]]:overflow-hidden`
/** One joined list owns the separators between its milestone rows. */
export const projectRoadmapRowsClassName = cn("[&>*+*]:border-t", "[&>*+*]:border-separator")
/** One roadmap row preserves identity, status, progress and destination order. */
export const projectMilestoneRowClassName = cn("flex", "min-h-[4.25rem]", "w-full", "min-w-0", "items-center", "gap-3", "px-4", "py-3", "transition-colors", "hover:bg-accent/5", "data-[state=accent]:bg-accent/5")
/** The marker and title form one progression identity. */
export const projectMilestoneIdentityClassName = cn("flex", "min-w-0", "flex-1", "items-center", "gap-3")
/** Future positions stay neutral while preserving the order signal. */
export const projectMilestoneMarkerClassName = cn("flex", "size-8", "shrink-0", "items-center", "justify-center", "rounded-full", "border", "border-border", "bg-surface-secondary", "text-xs", "font-semibold", "text-foreground")
/** Completed positions carry the evidenced affirmative state. */
export const projectMilestoneMarkerCompleteClassName = cn("flex", "size-8", "shrink-0", "items-center", "justify-center", "rounded-full", "bg-success-soft", "text-success")
/** Title and state remain scannable as a pair. */
export const projectMilestoneTextClassName = cn("flex", "min-w-0", "flex-col", "gap-1")
/** Three compact project facts read as one progress summary. */
export const projectMetricGridClassName = cn("grid", "w-full", "grid-cols-3", "overflow-hidden", "rounded-2xl", "bg-surface-secondary")
/** Each fact owns one aligned value-label pair. */
export const projectMetricItemClassName = cn("flex", "min-w-0", "flex-col", "gap-1", "px-3", "py-4", "text-center", "[&+&]:border-l", "[&+&]:border-separator")
