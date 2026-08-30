import { cn } from "@heroui/react"

/** Whole personal-project mission-control stack. */
export const coursePersonalProjectClassName = cn("@container", "box-border", "flex", "w-full", "min-w-0", "flex-col", "gap-6", "px-4", "py-6", "sm:px-6", "lg:px-8")
/** Breadcrumb, title and summary stack. */
export const projectHeaderClassName = cn("flex", "w-full", "max-w-3xl", "min-w-0", "flex-col", "gap-3")
/** Main roadmap plane and supporting evidence rail. */
export const projectBodyClassName = `${cn("grid", "w-full", "min-w-0", "grid-cols-1", "items-start", "gap-6", "@app-lg:items-start")} @app-lg:grid-cols-[minmax(0,1fr)_18rem]`
/** Reusable vertical rhythm inside either dashboard plane. */
export const projectStackClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-6")
/** The primary next-task decision inside its surface. */
export const projectNextTaskClassName = cn("flex", "w-full", "min-w-0", "flex-col", "items-start", "gap-3")
/** Progress and repository surfaces stay together without becoming sticky chrome. */
export const projectSidebarClassName = cn("grid", "w-full", "min-w-0", "grid-cols-1", "items-start", "gap-6", "@app-sm:grid-cols-2", "@app-lg:grid-cols-1")
/** Repository facts and its one external destination. */
export const projectRepositoryClassName = cn("flex", "w-full", "min-w-0", "flex-col", "items-start", "gap-4")
/** Roadmap count and search remain outside the joined list frame. */
export const projectRoadmapControlsClassName = cn("flex", "w-full", "min-w-0", "flex-row", "items-center", "justify-between", "gap-3", "sm:w-auto", "sm:justify-end", "[&>form]:min-w-0", "[&>form]:w-full", "sm:[&>form]:w-72")
/** Bound the project path so the evidence rail stays discoverable on one screen. */
export const projectRoadmapClassName = cn("[--starci-core-contained-max-height:32rem]")
/** One joined list owns the separators between its milestone rows. */
export const projectRoadmapRowsClassName = cn("[&>*+*]:border-t", "[&>*+*]:border-separator")
