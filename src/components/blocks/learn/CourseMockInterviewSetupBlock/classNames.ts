import { cn } from "@heroui/react"

/** Bounded practice home with one responsive page rhythm. */
export const mockInterviewWorkspaceClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-6", "break-words", "pt-6", "pb-12", "sm:pb-16")
/** Page identity separates the product promise from destination navigation. */
export const mockInterviewHeaderClassName = cn("flex", "min-w-0", "flex-col", "gap-3", "border-b", "border-separator", "pb-5")
/** Short identity copy never stretches into an unreadable desktop measure. */
export const mockInterviewHeaderCopyClassName = cn("flex", "max-w-3xl", "min-w-0", "flex-col", "gap-2")
/** Route-like peer destinations own one stable horizontal row and may scroll on compact screens. */
export const mockInterviewTabsClassName = cn("min-w-0", "overflow-x-auto", "border-b", "border-separator", "pb-1")
/** Resume is the only dominant action when unfinished work exists. */
export const mockInterviewResumeClassName = cn("flex", "min-w-0", "flex-col", "items-stretch", "gap-4", "rounded-medium", "bg-accent-soft", "p-5", "sm:flex-row", "sm:items-center", "sm:justify-between")
/** Copy inside a continuation card remains a compact, scannable cluster. */
export const mockInterviewResumeCopyClassName = cn("flex", "min-w-0", "flex-col", "gap-1")
/** Recent evidence follows setup on compact; at wide first-use also keeps the primary action above the fold. */
export const getMockInterviewDashboardClassName = (isFirstUse: boolean) => cn("order-2", "grid", "min-w-0", "grid-cols-1", "items-start", "gap-6", isFirstUse ? "lg:order-2" : "lg:order-none", "lg:grid-cols-3")
/** Recent history keeps the larger share of the practice dashboard. */
export const mockInterviewHistoryPanelClassName = cn("min-w-0", "lg:col-span-2")
/** Joined evidence rows keep action labels aligned without squeezing their facts. */
export const mockInterviewEvidenceListClassName = cn("m-0", "flex", "min-w-0", "list-none", "flex-col", "divide-y", "divide-separator", "p-0")
/** One completed interview row collapses safely on compact screens. */
export const mockInterviewEvidenceRowClassName = cn("flex", "min-w-0", "flex-col", "items-stretch", "gap-3", "p-4", "sm:flex-row", "sm:items-center", "sm:justify-between")
/** Text inside an evidence row owns truncation and wrapping independently of its action. */
export const mockInterviewEvidenceCopyClassName = cn("flex", "min-w-0", "flex-1", "flex-col", "gap-1")
/** Aggregate progress rows receive one consistent inset inside their surface. */
export const mockInterviewProgressClassName = cn("flex", "min-w-0", "flex-col", "gap-4", "p-5")
/** Empty dashboard owners have enough presence without manufacturing empty acreage. */
export const mockInterviewCompactStateClassName = cn("flex", "min-h-40", "min-w-0", "flex-col", "justify-center", "p-5")
/** New-session configuration and checkpoint split before the shell's 1024px boundary. */
export const mockInterviewSetupGridClassName = cn("grid", "min-w-0", "grid-cols-1", "items-stretch", "gap-0", "min-[900px]:grid-cols-3")
/** Compact readers reach setup first; wide first-use does the same until progress evidence exists. */
export const getMockInterviewSetupClassName = (isFirstUse: boolean) => cn("order-1", "min-w-0", isFirstUse ? "lg:order-1" : "lg:order-none")
/** Field groups use a single internal inset and predictable vertical rhythm. */
export const mockInterviewSetupFormClassName = cn("flex", "min-w-0", "flex-col", "gap-5", "p-5", "sm:p-6", "min-[900px]:col-span-2")
/** One selectable field and its consequence copy. */
export const mockInterviewFieldClassName = cn("flex", "min-w-0", "flex-col", "gap-2")
/** Pre-start checkpoint is visually separate but not a second elevated card. */
export const mockInterviewPreflightClassName = cn("flex", "min-w-0", "flex-col", "justify-between", "gap-5", "border-t", "border-separator", "bg-default-50", "p-5", "sm:p-6", "min-[900px]:border-s", "min-[900px]:border-t-0")
/** Selected settings are repeated once at the decision point. */
export const mockInterviewSummaryClassName = cn("flex", "min-w-0", "flex-col", "gap-3")
/** One compact label/value fact. */
export const mockInterviewFactClassName = cn("flex", "min-w-0", "flex-col", "gap-1")
/** Error, access and destination recovery stay visibly bounded. */
export const mockInterviewStateClassName = cn("flex", "min-h-64", "min-w-0", "flex-col", "items-start", "justify-center", "gap-4", "p-6", "sm:p-8")
/** Label-line actions wrap rather than collide with translated titles. */
export const mockInterviewActionRowClassName = cn("flex", "min-w-0", "flex-wrap", "gap-2")
