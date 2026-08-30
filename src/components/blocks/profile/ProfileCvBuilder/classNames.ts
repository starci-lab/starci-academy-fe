import { cn } from "@heroui/react"

/** Complete builder outcome, from document controls to compiled preview. */
export const cvBuilderClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-4")
/** Header keeps document identity and terminal actions together. */
export const cvBuilderHeaderClassName = cn("flex", "flex-col", "gap-4", "@app-md:flex-row", "@app-md:items-end", "@app-md:justify-between")
/** Tight identity stack for title, purpose and save state. */
export const cvBuilderTitleClassName = cn("flex", "min-w-0", "flex-col", "gap-1")
/** Wrapping action run for compile, publish and download. */
export const cvBuilderActionsClassName = cn("flex", "flex-wrap", "items-center", "gap-2")
/** Native compiled artifact link, visually subordinate to the primary compile action. */
export const cvBuilderPdfLinkClassName = cn("inline-flex", "min-h-10", "items-center", "gap-2", "rounded-xl", "px-3", "text-sm", "font-medium", "text-accent", "underline", "underline-offset-4")
/** Three-owner desktop workspace with deliberate stacked compact fallback. */
export const cvBuilderWorkspaceClassName = cn("grid", "min-w-0", "gap-4", "@app-lg:grid-cols-[13rem_minmax(22rem,1fr)_minmax(20rem,0.9fr)]", "@app-lg:items-start")
/** Structural outline and document settings. */
export const cvBuilderOutlineClassName = cn("flex", "min-w-0", "flex-col", "gap-4", "@app-lg:sticky", "@app-lg:top-rail")
/** One progress fact followed by its reason. */
export const cvBuilderProgressClassName = cn("flex", "flex-col", "gap-2")
/** Progress label and value share one baseline. */
export const cvBuilderProgressHeaderClassName = cn("flex", "items-baseline", "justify-between", "gap-2")
/** Observable completion rather than a decorative badge. */
export const cvBuilderProgressTrackClassName = cn("h-2", "w-full", "overflow-hidden", "rounded-full", "bg-default")
/** Actual completion mark; inline width remains the data carrier. */
export const cvBuilderProgressBarClassName = cn("h-full", "rounded-full", "bg-accent")
/** Scannable section destinations. */
export const cvBuilderOutlineListClassName = cn("hidden", "flex-col", "gap-1", "@app-lg:flex")
/** One section row inside the document outline. */
export const cvBuilderOutlineItemClassName = cn("flex", "min-h-10", "items-center", "justify-between", "gap-2", "rounded-xl", "px-3", "py-2", "text-sm", "first:bg-accent-soft", "first:text-accent-soft-foreground")
/** Style choices belong to the document owner. */
export const cvBuilderSettingsClassName = cn("hidden", "flex-col", "gap-3", "border-t", "pt-4", "@app-lg:flex")
/** Central editable owner. */
export const cvBuilderEditorClassName = cn("min-w-0")
/** Mode control remains compact and visible above its changing panel. */
export const cvBuilderModeClassName = cn("mb-5", "flex", "w-fit", "gap-1", "rounded-xl", "bg-default", "p-1")
/** One block/LaTeX mode button. */
export const getCvBuilderModeButtonClassName = (active: boolean) => cn("min-h-9", "rounded-lg", "px-3", "text-sm", "font-medium", active ? "bg-surface" : "text-muted")
/** Editable form blocks share one rhythm and one divider owner. */
export const cvBuilderFormClassName = cn("flex", "flex-col")
/** Each block is a peer section rather than a nested card. */
export const cvBuilderSectionClassName = cn("flex", "flex-col", "gap-4", "border-b", "py-6", "first:pt-0", "last:border-b-0", "last:pb-0")
/** Block title and contextual action. */
export const cvBuilderSectionHeaderClassName = cn("flex", "flex-col", "gap-3", "@app-sm:flex-row", "@app-sm:items-start", "@app-sm:justify-between")
/** Related form fields recompose from one to two columns. */
export const cvBuilderFieldsClassName = cn("grid", "gap-4", "@app-sm:grid-cols-2")
/** One visible label and its intrinsic input. */
export const cvBuilderFieldClassName = cn("flex", "min-w-0", "flex-col", "gap-2", "text-sm", "font-medium")
/** Full-span prose or token field. */
export const cvBuilderWideFieldClassName = cn(cvBuilderFieldClassName, "@app-sm:col-span-2")
/** Honest mutation feedback. */
export const cvBuilderFeedbackClassName = cn("rounded-xl", "bg-default", "p-3")
/** Raw source editor preserves code whitespace. */
export const cvBuilderTexClassName = cn("min-h-[38rem]", "w-full", "resize-y", "rounded-xl", "border", "bg-surface-secondary", "p-4", "font-mono", "text-sm", "leading-6", "outline-none", "focus:border-focus")
/** Preview stays reachable while long fields scroll on wide screens. */
export const cvBuilderPreviewClassName = cn("min-w-0", "@app-lg:sticky", "@app-lg:top-rail")
/** Preview toolbar is one semantic group above the paper. */
export const cvBuilderPreviewHeaderClassName = cn("mb-3", "flex", "flex-wrap", "items-center", "justify-between", "gap-3")
/** Uncompiled live draft stage. */
export const cvBuilderPaperStageClassName = cn("min-h-document", "overflow-auto", "rounded-xl", "bg-default", "p-4", "@app-sm:p-6")
/** ATS-safe document likeness before server compilation. */
export const cvBuilderPaperClassName = cn("mx-auto", "min-h-[42rem]", "w-full", "max-w-[36rem]", "bg-white", "p-8", "text-black", "shadow-xl", "@app-sm:p-10")
/** Draft document header. */
export const cvBuilderPaperIdentityClassName = cn("mb-6", "flex", "flex-col", "items-center", "gap-1", "text-center")
/** Name is the dominant fact on the ATS draft. */
export const cvBuilderPaperNameClassName = cn("text-xl", "font-semibold")
/** Target role carries the configured accent. */
export const cvBuilderPaperRoleClassName = cn("text-accent")
/** Contact line remains compact and secondary. */
export const cvBuilderPaperContactClassName = cn("text-xs", "text-neutral-600")
/** Draft document section hierarchy. */
export const cvBuilderPaperSectionClassName = cn("mt-5", "flex", "flex-col", "gap-2", "text-sm", "leading-5")
/** Purple rule belongs to the LaTeX template preview. */
export const cvBuilderPaperHeadingClassName = cn("border-b", "border-accent", "pb-1", "text-sm", "font-semibold", "text-accent")
/** Initial empty/error builder keeps one useful decision. */
export const cvBuilderSituationClassName = cn("mx-auto", "flex", "max-w-form", "flex-col", "items-center", "gap-4", "py-12", "text-center")
