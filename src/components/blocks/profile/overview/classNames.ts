import { cn } from "@heroui/react"

/** Joined course evidence rows. */
export const profileEvidenceListClassName = cn("flex", "flex-col", "divide-y", "divide-separator", "p-0")
/** One joined course row led by its course artwork. */
export const profileCourseRowClassName = cn("flex", "w-full", "flex-row", "items-center", "gap-4", "p-4")
/** Course identity and progress qualifiers beside the artwork. */
export const profileCourseIdentityClassName = cn("flex", "min-w-0", "grow", "flex-col", "gap-1")
/** Course title and compact completion fact share one scan line. */
export const profileCourseHeadingClassName = cn("flex", "min-w-0", "flex-row", "items-center", "justify-between", "gap-3")
/** Readiness content flow; the owning SurfaceCard supplies the single compact inset. */
export const profileReadinessCardClassName = cn("flex", "flex-col", "gap-3")
/** Readiness summary remains left aligned while its band settles at the far edge. */
export const profileReadinessSummaryClassName = cn("flex", "flex-row", "flex-wrap", "items-start", "justify-between", "gap-x-3", "gap-y-1")
/** Track identity pairs one compact score fact with a subordinate course label. */
export const profileReadinessTrackClassName = cn("flex", "min-w-0", "flex-row", "items-center", "gap-2")
/** Joined readiness metrics inside the nested list surface. */
export const profileReadinessListClassName = cn("flex", "flex-col", "divide-y", "divide-separator")
/** Skill snapshot controls sharing one width. */
export const skillSnapshotClassName = cn("flex", "flex-col", "gap-4", "[&>*]:w-full")
/** Count-only skill evidence is a joined nested list, never a progress visualization. */
export const profileSkillListClassName = cn("flex", "flex-col", "divide-y", "divide-separator")
