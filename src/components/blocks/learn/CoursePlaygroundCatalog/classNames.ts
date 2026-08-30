import { cn } from "@heroui/react"

/** Catalog page identity and bounded page inset. */
export const playgroundCatalogClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-8", "px-4", "py-6", "sm:px-6", "sm:py-8", "lg:px-8", "xl:px-10")
/** Hero composition pairs the user promise with course-owned preview media. */
export const playgroundCatalogHeroClassName = cn("grid", "min-w-0", "overflow-hidden", "bg-accent-soft", "lg:grid-cols-2")
/** Primary hero copy owns the task and the first action. */
export const playgroundCatalogHeroContentClassName = cn("flex", "min-w-0", "flex-col", "justify-center", "gap-5", "p-6", "sm:p-8", "lg:p-10")
/** Compact product promise above the page title. */
export const playgroundCatalogEyebrowClassName = cn("inline-flex", "w-fit", "items-center", "gap-2", "rounded-full", "border", "border-accent/20", "bg-background/80", "px-3", "py-2", "text-accent-soft-foreground")
/** Keep the hero explanation readable at every responsive width. */
export const playgroundCatalogHeroCopyClassName = cn("flex", "max-w-2xl", "flex-col", "gap-3")
/** Derived catalog facts sit below the promise without pretending to be progress. */
export const playgroundCatalogFactsClassName = cn("grid", "grid-cols-2", "gap-4", "border-y", "border-accent/15", "py-4")
/** One compact fact keeps its label visibly subordinate. */
export const playgroundCatalogFactClassName = cn("flex", "min-w-0", "flex-col", "gap-1")
/** Keep the primary action aligned to its content instead of stretching across the hero. */
export const playgroundCatalogActionClassName = cn("flex", "w-fit")
/** Course preview is informative media and therefore contained rather than cropped. */
export const playgroundCatalogPreviewClassName = cn("relative", "flex", "min-h-64", "items-center", "justify-center", "overflow-hidden", "border-t", "border-accent/15", "bg-accent/10", "p-5", "sm:min-h-80", "sm:p-7", "lg:min-h-full", "lg:border-t-0", "lg:border-l")
/** Preserve the complete authored preview at wide, intermediate, and compact widths. */
export const playgroundCatalogPreviewImageClassName = cn("aspect-[4/3]", "max-h-[30rem]", "w-full", "rounded-2xl", "bg-background", "object-contain", "shadow-xl", "ring-1", "ring-accent/15")
/** Verification ownership remains explicit on the preview rather than inferred from color. */
export const playgroundCatalogVerificationClassName = cn("absolute", "right-7", "top-7", "rounded-full", "bg-success-soft", "px-3", "py-2", "text-success-soft-foreground", "shadow-sm")
/** Section copy introduces the multi-lab decision below the hero. */
export const playgroundCatalogHeaderClassName = cn("flex", "max-w-3xl", "flex-col", "gap-2")
/** Reflow lab choices from one scan column into a balanced route map. */
export const playgroundCatalogGridClassName = cn("grid", "w-full", "min-w-0", "grid-cols-1", "gap-4", "md:grid-cols-2", "2xl:grid-cols-3")
/** Each lab is a compact stage with identity, verified-step fact, and one action. */
export const playgroundCatalogCardClassName = cn("flex", "min-h-56", "min-w-0", "flex-col", "justify-between", "gap-6", "p-5", "sm:p-6")
/** Sequence and backend icon make each stage easy to scan. */
export const playgroundCatalogCardTopClassName = cn("flex", "items-start", "justify-between", "gap-4")
/** Large icon tile gives the backend-authored lab identity a useful visual job. */
export const playgroundCatalogIconClassName = cn("flex", "size-12", "shrink-0", "items-center", "justify-center", "rounded-2xl", "bg-accent-soft", "text-2xl", "text-accent-soft-foreground")
/** Lab identity and step fact form one compact reading group. */
export const playgroundCatalogCardBodyClassName = cn("flex", "min-w-0", "flex-col", "gap-3")
/** Anchor step count and entry action at the card boundary. */
export const playgroundCatalogMetaClassName = cn("flex", "flex-col", "items-start", "gap-4", "border-t", "border-divider", "pt-4", "sm:flex-row", "sm:items-center", "sm:justify-between")
