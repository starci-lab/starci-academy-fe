import { cn } from "@heroui/react"

/** Course-level Flashcard hub with one responsive page inset. */
export const flashcardHubClassName = cn("mx-auto", "flex", "w-full", "max-w-7xl", "min-w-0", "flex-col", "gap-6", "break-words", "px-4", "py-6", "sm:px-6", "lg:px-8")
/** Keeps the page identity compact and visually ahead of the mode decision. */
export const flashcardHubHeaderClassName = cn("flex", "min-w-0", "flex-col", "gap-2", "border-b", "border-separator", "pb-5")
/** Owns the explicit Study-versus-Quiz decision. */
export const flashcardModeSectionClassName = cn("flex", "min-w-0", "flex-col", "gap-3")
/** Two peer mode owners become a deliberate stack at compact widths. */
export const flashcardModeGridClassName = cn("grid", "min-w-0", "grid-cols-1", "gap-4", "md:grid-cols-2")
/** Internal rhythm for one mode SurfaceCard. */
export const flashcardModeCardClassName = cn("flex", "min-h-48", "min-w-0", "flex-col", "items-start", "gap-4", "p-5")
/** Keeps the mode consequence attached to its name. */
export const flashcardModeCopyClassName = cn("flex", "min-w-0", "flex-1", "flex-col", "gap-2")
/** Wraps availability facts without creating a second card. */
export const flashcardFactRowClassName = cn("flex", "flex-wrap", "items-center", "gap-x-4", "gap-y-2")
/** Separates secondary evidence navigation from the primary mode decision. */
export const flashcardViewNavClassName = cn("min-w-0", "border-b", "border-separator", "pb-4")
/** Wide overview gives the due task a bounded owner beside the deck library. */
export const flashcardOverviewClassName = cn("grid", "min-w-0", "grid-cols-1", "items-start", "gap-6", "xl:grid-cols-[18rem_1fr]")
/** Compact due owner. */
export const flashcardDueCardClassName = cn("flex", "min-w-0", "flex-col", "gap-4", "p-5")
/** Deck library and its search controls. */
export const flashcardDeckSectionClassName = cn("flex", "min-w-0", "flex-col", "gap-4")
/** Deck heading and density controls share one responsive toolbar. */
export const flashcardDeckToolbarClassName = cn("flex", "min-w-0", "flex-col", "gap-3", "sm:flex-row", "sm:items-end", "sm:justify-between")
/** Selects a calm grid or joined scan line without changing behavior. */
export const getFlashcardDeckGridClassName = (layout: "grid" | "line") => cn("grid", "min-w-0", "gap-4", "grid-cols-1", layout === "grid" && "lg:grid-cols-2")
/** One deck owns its facts and both legal next actions. */
export const flashcardDeckCardClassName = cn("flex", "min-w-0", "flex-col", "gap-3", "p-4")
/** Keeps a large catalogue scannable while search still indexes the full description. */
export const flashcardDeckDescriptionClassName = cn("line-clamp-3")
/** Deck actions wrap rather than overflow. */
export const flashcardActionRowClassName = cn("flex", "flex-wrap", "gap-2")
/** Stable owner for empty, unavailable, and failed states. */
export const flashcardStateClassName = cn("flex", "min-h-40", "min-w-0", "flex-col", "items-start", "justify-center", "gap-3", "p-5", "sm:p-6")
/** Joined evidence rows retain a consistent content inset. */
export const flashcardEvidenceListClassName = cn("m-0", "flex", "min-w-0", "list-none", "flex-col", "divide-y", "divide-separator", "p-0")
/** One history or health fact row. */
export const flashcardEvidenceRowClassName = cn("flex", "min-w-0", "flex-col", "gap-1", "p-4")
/** Prevents modal content from touching the Grammar frame. */
export const flashcardModalClassName = cn("flex", "min-w-0", "flex-col", "gap-4", "p-5")
