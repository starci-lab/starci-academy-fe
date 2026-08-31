import { cn } from "@heroui/react"

/** Page-local catalog frame; ancestor shell geometry remains untouched. */
export const playgroundCatalogClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-6", "px-4", "py-5", "sm:gap-8", "sm:px-6", "sm:py-8", "lg:px-8", "xl:px-10")
/** Compact technical hero using one primary and one supporting owner. */
export const playgroundCatalogHeroClassName = cn("grid", "min-w-0", "overflow-hidden", "bg-accent-soft", "lg:grid-cols-[5fr_3fr]")
/** Hero copy column. */
export const playgroundCatalogHeroContentClassName = cn("flex", "min-w-0", "flex-col", "justify-center", "gap-5", "p-6", "sm:p-8", "lg:p-10")
/** Compact Playground identity label. */
export const playgroundCatalogEyebrowClassName = cn("inline-flex", "w-fit", "items-center", "gap-2", "rounded-full", "border", "border-accent/20", "bg-background/80", "px-3", "py-2", "text-accent-soft-foreground")
/** Bounded hero heading and description. */
export const playgroundCatalogHeroCopyClassName = cn("flex", "max-w-2xl", "flex-col", "gap-3")
/** One readable sentence replaces an unsupported repeated metric group. */
export const playgroundCatalogFactsClassName = cn("flex", "min-w-0", "flex-wrap", "items-center", "gap-x-3", "gap-y-2", "text-sm")
/** One compact catalog fact. */
export const playgroundCatalogFactClassName = cn("inline-flex", "items-baseline", "gap-1.5", "rounded-full", "border", "border-accent/15", "bg-background/70", "px-3", "py-2")
/** Hero catalog action owner. */
export const playgroundCatalogActionClassName = cn("flex", "w-fit")
/** Purposeful process preview shown when no authored media exists. */
export const playgroundCatalogPreviewClassName = cn("relative", "flex", "min-w-0", "flex-col", "justify-center", "gap-5", "border-t", "border-accent/15", "bg-background/55", "p-6", "sm:p-8", "lg:border-l", "lg:border-t-0")
/** Authored preview image frame. */
export const playgroundCatalogPreviewImageClassName = cn("aspect-[4/3]", "max-h-80", "w-full", "rounded-2xl", "bg-background", "object-contain", "shadow-lg", "ring-1", "ring-accent/15")
/** Server-verification promise chip. */
export const playgroundCatalogVerificationClassName = cn("inline-flex", "w-fit", "items-center", "gap-2", "rounded-full", "bg-success-soft", "px-3", "py-2", "text-success-soft-foreground")
/** Three-step process preview stack. */
export const playgroundCatalogProcessClassName = cn("flex", "flex-col", "gap-3")
/** One process preview row. */
export const playgroundCatalogProcessStepClassName = cn("grid", "grid-cols-[2rem_1fr]", "items-center", "gap-3", "rounded-xl", "border", "border-divider", "bg-background/85", "p-3")
/** Process preview ordinal. */
export const playgroundCatalogProcessNumberClassName = cn("flex", "size-8", "items-center", "justify-center", "rounded-lg", "bg-accent-soft", "text-sm", "font-semibold", "text-accent-soft-foreground")
/** Catalog list heading. */
export const playgroundCatalogHeaderClassName = cn("flex", "max-w-3xl", "flex-col", "gap-2")
/** Responsive Playground card grid. */
export const playgroundCatalogGridClassName = cn("grid", "w-full", "min-w-0", "grid-cols-1", "gap-4", "md:grid-cols-2")
/** One selectable Playground card. */
export const playgroundCatalogCardClassName = cn("flex", "min-h-52", "min-w-0", "flex-col", "justify-between", "gap-5", "p-5", "sm:p-6")
/** Card identity row. */
export const playgroundCatalogCardTopClassName = cn("flex", "items-start", "justify-between", "gap-4")
/** Card technology icon frame. */
export const playgroundCatalogIconClassName = cn("flex", "size-11", "shrink-0", "items-center", "justify-center", "rounded-xl", "bg-accent-soft", "text-accent-soft-foreground")
/** Card title and description stack. */
export const playgroundCatalogCardBodyClassName = cn("flex", "min-w-0", "flex-col", "gap-2")
/** Card metadata and action row. */
export const playgroundCatalogMetaClassName = cn("flex", "items-center", "justify-between", "gap-4", "border-t", "border-divider", "pt-4")
/** Catalog loading, empty, or error notice inset. */
export const playgroundCatalogNoticeClassName = cn("p-5", "sm:p-6")
