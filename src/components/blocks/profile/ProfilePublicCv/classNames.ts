import { cn, skeletonVariants } from "@heroui/react"

/** One calm application-owned workspace around every public-CV state. */
export const publicCvWorkspaceClassName = cn(
    "min-w-0",
    "overflow-hidden",
    "rounded-2xl",
    "border",
    "border-separator",
    "bg-surface",
    "shadow-sm",
)

/** Keeps document identity and actions in one stable header owner. */
export const publicCvHeaderClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "gap-4",
    "border-b",
    "border-separator",
    "px-4",
    "py-4",
    "@app-md:flex-row",
    "@app-md:items-center",
    "@app-md:justify-between",
    "@app-md:px-6",
)

/** Groups the document name, neutral state and freshness as one fact cluster. */
export const publicCvIdentityClassName = cn("flex", "min-w-0", "flex-col", "gap-2")
/** Keeps a long document name and its compact state legible on one wrapping axis. */
export const publicCvTitleRowClassName = cn("flex", "min-w-0", "flex-wrap", "items-center", "gap-2")
/** Groups same-owner document destinations without promoting competing actions. */
export const publicCvActionsClassName = cn("flex", "shrink-0", "flex-wrap", "items-center", "gap-2")

/** Gives the embedded document a quiet stage without creating another card owner. */
export const publicCvDocumentStageClassName = cn("min-w-0", "bg-default-50", "p-2", "@app-md:p-4")
/** Bounds the external PDF renderer inside the application's document stage. */
export const publicCvDocumentFrameClassName = cn(
    "mx-auto",
    "w-full",
    "max-w-[56rem]",
    "overflow-hidden",
    "rounded-xl",
    "border",
    "border-separator",
    "bg-background",
    "shadow-sm",
)

/** Settled absence and recovery keep a useful bounded owner at every width. */
export const publicCvNoticeClassName = cn(
    "flex",
    "min-h-64",
    "min-w-0",
    "flex-col",
    "items-center",
    "justify-center",
    "gap-4",
    "px-5",
    "py-10",
    "text-center",
)
/** Binds one state title to its recovery explanation. */
export const publicCvNoticeCopyClassName = cn("flex", "max-w-lg", "flex-col", "items-center", "gap-2")

/** Loading keeps the eventual paper geometry visible without mounting a blank iframe. */
export const publicCvSkeletonClassName = cn(
    "mx-auto",
    "flex",
    "h-[68vh]",
    "min-h-[32rem]",
    "max-h-[64rem]",
    "w-full",
    "max-w-[56rem]",
    "flex-col",
    "gap-6",
    "rounded-xl",
    "border",
    "border-separator",
    "bg-background",
    "p-6",
    "shadow-sm",
    "@app-md:min-h-[42rem]",
    "@app-md:p-10",
)
/** Reserves the primary document-title measure while data resolves. */
export const publicCvSkeletonHeadingClassName = skeletonVariants({ animationType: "shimmer" }).base({ className: cn("h-7", "w-2/3", "max-w-80", "rounded-md") })
/** Reserves one compact metadata line under the document title. */
export const publicCvSkeletonMetaClassName = skeletonVariants({ animationType: "shimmer" }).base({ className: cn("h-4", "w-2/5", "max-w-48", "rounded") })
/** Marks the visual transition from document identity to document body. */
export const publicCvSkeletonRuleClassName = skeletonVariants({ animationType: "shimmer" }).base({ className: cn("h-px", "w-full", "rounded") })
/** Reserves one full-width line in the document-shaped loading body. */
export const publicCvSkeletonLineClassName = skeletonVariants({ animationType: "shimmer" }).base({ className: cn("h-4", "w-full", "rounded") })
/** Alternates body measures so loading reads as a document rather than a solid panel. */
export const publicCvSkeletonShortLineClassName = skeletonVariants({ animationType: "shimmer" }).base({ className: cn("h-4", "w-4/5", "rounded") })
