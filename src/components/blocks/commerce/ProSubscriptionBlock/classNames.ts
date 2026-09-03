import { cn } from "@heroui/react"

/**
 * Vertical route inset for the Pro decision surface; one scale step at the wider breakpoint.
 *
 * `sm:` survives here and nowhere else in this file: this is the route's own outer band, above
 * `PageContainer` and outside every container query, so the layout viewport really is what owns it.
 * Every other region below sits inside a Grammar container and is queried as such
 * (RESPONSIVE-2 Case 5).
 */
export const proPageClassName = cn(
    "py-6",
    "sm:py-8",
)
/** Breadcrumb and offer introduction share one compact orientation stack. */
export const proHeroClassName = cn("flex", "max-w-3xl", "min-w-0", "flex-col", "gap-3")
/** Failed state preserves route orientation before the recovery surface. */
export const proFailedStackClassName = cn("flex", "min-w-0", "flex-col", "gap-6")
/** Hero introduction above the offer workspace: two page regions with distinct purposes. */
export const proPageStackClassName = cn("flex", "min-w-0", "flex-col", "gap-6")
/** Stack of explanatory product surfaces. */
export const proMainClassName = cn("flex", "min-w-0", "flex-col", "gap-6")
/** One explanatory region: its own section anchor above the surface that carries the content. */
export const proSectionClassName = cn("flex", "min-w-0", "flex-col", "gap-3")
/** First flush band: explanatory copy on the shared neutral surface. */
export const proBenefitIntroClassName = cn(
    "bg-surface-secondary",
    "px-4",
    "py-3",
    "text-foreground",
)
/** The generated journey is its own edge-to-edge joined band; the SurfaceCard owns outer clipping. */
export const proBenefitJourneyBandClassName = cn("min-w-0", "border-t", "border-separator", "bg-surface-secondary")
/** Preserve the generated asset ratio without an inset frame or letterbox. */
export const proBenefitJourneyImageClassName = cn("block", "h-auto", "w-full")
/**
 * Closed grid of the four included outcome groups; the owning surface supplies the outer boundary.
 *
 * The second column appears when the CARD is wide enough, not when the window is: this list lives
 * inside a `SurfaceCard`, whose inline-size container the `@app-sm` query observes. A narrow primary
 * column inside a wide window therefore keeps one column, which `sm:` could not express.
 */
export const proBenefitListClassName = cn(
    "m-0",
    "grid",
    "min-w-0",
    "list-none",
    "grid-cols-1",
    "border-t",
    "border-separator",
    "p-0",
    "@app-sm:grid-cols-2",
)
/** One included outcome row with shared separators; its rules follow the same container as the grid. */
export const proBenefitClassName = cn(
    "flex",
    "min-w-0",
    "items-start",
    "gap-3",
    "border-b",
    "border-separator",
    "p-4",
    "last:border-b-0",
    "@app-sm:[&:nth-last-child(-n+2)]:border-b-0",
    "@app-sm:[&:nth-child(odd)]:border-r",
)
/** App-owned cell holding the Grammar mark against the first line of the outcome copy. */
export const proBenefitMarkClassName = cn("flex", "shrink-0", "text-accent-soft-foreground")
/** Title and explanation stack for one outcome. */
export const proBenefitCopyClassName = cn("flex", "min-w-0", "flex-col", "gap-1")
/** One Grammar-owned joined disclosure surface. */
export const proDisclosureClassName = cn("min-w-0")
/** Full-width disclosure trigger content with a standard trailing indicator. */
export const proDisclosureSummaryClassName = cn("flex", "w-full", "min-w-0", "items-center", "justify-between", "gap-3", "text-left")
/** Readable disclosure body without another card boundary. */
export const proDisclosureBodyClassName = cn("min-w-0")
/** Semantic rail boundary around the purchase decision. */
export const proRailClassName = cn("min-w-0")
/** Joined plan composition; each direct child owns its own spacing and boundary. */
export const proPlanClassName = cn("flex", "min-w-0", "flex-col")
/**
 * Plan identity and billing facts, separated from the action band by gap-3.
 *
 * One inset at every width. The rail is 20-24rem wide whatever the window does, so the wider inset
 * this band used to take at the `sm:` viewport was never a response to its own space.
 */
export const proPlanDetailsClassName = cn(
    "flex",
    "min-w-0",
    "flex-col",
    "gap-4",
    "px-4",
    "pt-4",
    "pb-4",
    "data-[has-actions=true]:pb-3",
)
/** Alignment boundary for plan identity and access badge. */
export const proPlanHeadingClassName = cn("flex", "items-center", "justify-between", "gap-3")
/** Price and billing period share one accessible fact. */
export const proPriceClassName = cn("flex", "flex-wrap", "items-end", "gap-x-2", "gap-y-1")
/** Dominant monetary figure in the decision rail. */
export const proPriceValueClassName = cn("text-4xl", "font-semibold", "tracking-tight", "text-foreground")
/** Persistent pending or active state explanation. */
export const proStatusClassName = cn("rounded-xl", "bg-accent-soft", "p-3")
/** Full-bleed divider and inset action content for the purchase boundary; one inset, as the band above. */
export const proActionsClassName = cn(
    "grid",
    "grid-cols-1",
    "gap-2",
    "border-t",
    "border-separator",
    "px-4",
    "pb-4",
    "pt-3",
)
/** Failed-offer notice inset. */
export const proNoticeClassName = cn("flex", "min-w-0", "flex-col", "gap-4", "p-4")
/** Compact recovery action that does not overpower a short error explanation. */
export const proRetryActionsClassName = cn("flex", "justify-start")
