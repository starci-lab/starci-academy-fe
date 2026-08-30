import { cn } from "@heroui/react"

/** Distraction-free session room with responsive page inset. */
export const sessionWorkspaceClassName = cn("mx-auto", "flex", "w-full", "max-w-7xl", "min-w-0", "flex-col", "gap-5", "break-words", "px-4", "py-5", "sm:px-6", "lg:px-8")
/** Keeps identity, save state, and deliberate exit together. */
export const sessionHeaderClassName = cn("flex", "min-w-0", "flex-col", "gap-4", "border-b", "border-separator", "pb-5", "lg:flex-row", "lg:items-end", "lg:justify-between")
/** Header copy and breadcrumbs share one reading order. */
export const sessionHeaderCopyClassName = cn("flex", "min-w-0", "flex-1", "flex-col", "gap-2")
/** Save state and exit wrap at compact widths. */
export const sessionHeaderActionsClassName = cn("flex", "min-w-0", "flex-wrap", "items-center", "gap-3")
/** Main learning surface and navigator rail. */
export const sessionGridClassName = cn("grid", "min-w-0", "grid-cols-1", "items-start", "gap-6", "xl:grid-cols-[1fr_18rem]")
/** Focus-room task column. */
export const sessionTaskColumnClassName = cn("flex", "min-w-0", "flex-col", "gap-5")
/** Prompt card internal spacing. */
export const sessionPromptClassName = cn("flex", "min-h-80", "min-w-0", "flex-col", "justify-between", "gap-6", "p-5", "sm:p-7")
/** Groups deck/level facts without adding a nested surface. */
export const sessionMetaClassName = cn("flex", "min-w-0", "flex-wrap", "gap-x-4", "gap-y-2")
/** Study prompt or Quiz cloze body. */
export const sessionPromptBodyClassName = cn("flex", "min-w-0", "flex-1", "flex-col", "justify-center", "gap-4")
/** Explains why a revisited answer is visible but cannot be changed. */
export const sessionReadOnlyNoticeClassName = cn("flex", "min-w-0", "flex-col", "gap-1", "rounded-medium", "border", "border-separator", "bg-default-50", "p-4")
/** Word bank wraps into reachable touch targets. */
export const sessionWordBankClassName = cn("flex", "min-w-0", "flex-wrap", "gap-2")
/** Primary and recovery actions never overflow. */
export const sessionActionRowClassName = cn("flex", "min-w-0", "flex-wrap", "gap-2")
/** Answer or feedback owner inside the prompt card. */
export const sessionAnswerClassName = cn("flex", "min-w-0", "flex-col", "gap-2", "rounded-medium", "bg-default-50", "p-4")
/** One cloze blank keeps its choice and optional hint together. */
export const sessionBlankClassName = cn("flex", "min-w-0", "flex-col", "gap-1")
/** Four rating actions form a stable grid. */
export const sessionRatingClassName = cn("grid", "min-w-0", "grid-cols-2", "gap-2", "p-4", "sm:grid-cols-4")
/** Keeps the rating instruction inside the same padded owner as its controls. */
export const sessionRatingHintClassName = cn("px-4", "pb-4")
/** Navigator stays bounded and becomes ordinary flow on compact screens. */
export const sessionNavigatorClassName = cn("flex", "min-w-0", "flex-col", "gap-4", "p-4", "xl:sticky", "xl:top-6")
/** Question buttons reflow without horizontal scrolling. */
export const sessionQuestionGridClassName = cn("grid", "min-w-0", "grid-cols-5", "gap-2", "sm:grid-cols-8", "xl:grid-cols-5")
/** Previous/next pair remains reachable. */
export const sessionNavigationActionsClassName = cn("grid", "min-w-0", "grid-cols-2", "gap-2")
/** Full owner for invalid, expired, and transport failure. */
export const sessionRecoveryClassName = cn("flex", "min-h-44", "min-w-0", "flex-col", "items-start", "justify-center", "gap-4", "p-5", "sm:p-6")
