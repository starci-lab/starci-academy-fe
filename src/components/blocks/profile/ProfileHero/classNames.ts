import { cn } from "@heroui/react"

/** Public identity uses one full-width card before evidence splits into lanes. */
export const profileHeroGridClassName = `${cn(
    "grid",
    "items-start",
    "gap-4",
    "@app-md:items-center",
)} grid-cols-[auto_minmax(0,1fr)] @app-md:grid-cols-[auto_minmax(0,1fr)_auto]`
/** Identity separates a personal identifier from professional evidence. */
export const profileIdentityStackClassName = cn("flex", "min-w-0", "flex-col", "gap-4")
/** Handle and name form one tightly related public identifier. */
export const profileNameHandleStackClassName = cn("flex", "min-w-0", "flex-col", "gap-1")
/** Role and biography are one professional statement, separate from the person's name. */
export const profileProfessionalStackClassName = cn("flex", "min-w-0", "flex-col", "gap-2")
/** Wrapping run of short profile facts. */
export const profileFactRunClassName = cn("flex", "flex-row", "flex-wrap", "items-center", "gap-x-4", "gap-y-1")
/** Baseline-aligned public proof facts. */
export const profileProofRowClassName = cn("flex", "flex-row", "flex-wrap", "items-baseline", "gap-x-4", "gap-y-1")
/** Primary profile action beside its compact peer. */
export const profileActionRowClassName = cn("flex", "w-full", "flex-row", "items-center", "gap-2", "[&>*:first-child]:grow")
/** Action and low-priority metadata settle into the final identity column. */
export const profileActionColumnClassName = cn("col-span-full", "flex", "min-w-48", "flex-col", "gap-2", "@app-md:col-span-1")
/** Supporting links share a compact wrapping run. */
export const profileMetaListClassName = cn("flex", "flex-row", "flex-wrap", "items-center", "gap-x-3", "gap-y-1")
/** AI-first evidence summary keeps the most useful proof directly under identity. */
export const profileEvidenceSummaryClassName = cn("col-span-full", "flex", "flex-row", "flex-wrap", "items-center", "gap-x-6", "gap-y-2", "rounded-xl", "bg-accent-soft", "p-3")
/** Evidence facts follow the summary label without becoming another card. */
export const profileEvidenceFactRunClassName = cn("flex", "min-w-0", "flex-row", "flex-wrap", "items-center", "gap-x-6", "gap-y-1")
