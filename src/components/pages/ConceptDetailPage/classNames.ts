import { cn } from "@heroui/react"

/** Outer inset for the wide concept reader. */
export const detailPageClassName = cn("py-6")
/** Bind identity and metadata above the reading workspace. */
export const detailHeaderClassName = cn("mb-6", "flex", "min-w-0", "flex-col", "gap-3", "border-b", "border-separator", "pb-6")
/** Quiet route back to the concept catalog. */
export const detailBackClassName = cn("w-fit", "text-sm", "font-semibold", "text-accent", "hover:underline", "focus-visible:outline-2", "focus-visible:outline-offset-4", "focus-visible:outline-focus")
/** Wrapping run of concept facts. */
export const detailMetaClassName = cn("flex", "flex-wrap", "items-center", "gap-2")
/** Reading-path stack inside the leading navigation track. */
export const navigationClassName = cn("flex", "min-w-0", "flex-col", "gap-4")
/** Keep path name and current position together. */
export const navigationHeaderClassName = cn("flex", "flex-col", "gap-1", "px-2")
/** Dominant lesson track and its sibling tabs. */
export const primaryClassName = cn("flex", "min-w-0", "flex-col", "gap-5")
/** Section phase and title stay visually attached. */
export const lessonHeaderClassName = cn("flex", "min-w-0", "flex-col", "gap-2")
/** Safe source files form one vertical reading run. */
export const sourceStackClassName = cn("flex", "min-w-0", "flex-col", "gap-5")
/** Practice prompts are peers rather than one merged answer. */
export const activityStackClassName = cn("flex", "min-w-0", "flex-col", "gap-4")
/** Internal rhythm of one authored activity. */
export const activityCardClassName = cn("flex", "min-w-0", "flex-col", "gap-3")
/** Noninteractive authored options remain grouped. */
export const optionListClassName = cn("flex", "flex-col", "gap-2")
/** One display-only option in the read-only MVP. */
export const optionClassName = cn("rounded-medium", "border", "border-separator", "bg-background", "px-3", "py-2", "text-sm")
/** Contextual prompt and reference surfaces in the trailing rail. */
export const contextStackClassName = cn("flex", "min-w-0", "flex-col", "gap-5")
/** Compact reading rhythm inside one context surface. */
export const contextGroupClassName = cn("flex", "min-w-0", "flex-col", "gap-3")
/** Plain semantic lists for outcomes, prerequisites, and sources. */
export const statementListClassName = cn("flex", "flex-col", "gap-2", "text-sm")
/** External reference treatment with safe wrapping. */
export const referenceClassName = cn("break-words", "text-sm", "text-accent", "hover:underline")
