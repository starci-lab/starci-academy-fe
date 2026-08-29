import { cn } from "@heroui/react"

/** Repeating project evidence sections. */
export const profileMainClassName = cn("flex", "min-w-0", "grow", "flex-col", "gap-6")
/** Equal pinned-project tiles that stack when narrow. */
export const profileProjectCardGridClassName = cn("grid", "grid-cols-1", "gap-4", "sm:grid-cols-2")
/** Joined capstone evidence rows. */
export const profileEvidenceListClassName = cn("flex", "flex-col", "divide-y", "divide-separator", "p-0")
