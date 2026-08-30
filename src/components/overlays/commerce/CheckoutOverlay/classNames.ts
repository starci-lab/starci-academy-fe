import { cn } from "@heroui/react"

/** One scroll owner keeps actions reachable on compact viewports. */
export const checkoutOverlayClassName = cn("flex", "max-h-[calc(100dvh-2rem)]", "min-w-0", "flex-col", "overflow-y-auto")
/** Payment name and consequence. */
export const checkoutHeaderClassName = cn("flex", "flex-col", "gap-2", "border-b", "border-separator", "px-5", "py-5", "sm:px-6")
/** Decision evidence below the header. */
export const checkoutBodyClassName = cn("flex", "min-w-0", "flex-col", "gap-4", "p-5", "sm:p-6")
/** Price and provider are peer decision evidence on roomy surfaces and stack on compact ones. */
export const checkoutDecisionClassName = cn("grid", "min-w-0", "grid-cols-1", "gap-3", "sm:grid-cols-2", "[&>*]:min-w-0")
/** Tighten the shared summary into label/value rows and promote its total. */
export const checkoutSummaryClassName = cn(
    "rounded-xl", "bg-default", "p-4",
    "[&>div]:flex", "[&>div]:flex-col", "[&>div]:gap-2",
    "[&>div>div]:flex", "[&>div>div]:items-baseline", "[&>div>div]:justify-between", "[&>div>div]:gap-4",
    "[&>div>div:last-child]:mt-1", "[&>div>div:last-child]:border-t", "[&>div>div:last-child]:border-separator", "[&>div>div:last-child]:pt-3",
)
/** The one supported payment method, shown as a selected decision rather than a fake picker. */
export const checkoutMethodClassName = cn("rounded-xl", "border", "border-accent", "bg-accent-soft", "p-4")
/** Keep provider name and supporting explanation in reading order. */
export const checkoutMethodCopyClassName = cn("flex", "min-w-0", "flex-col", "gap-1")
/** Webhook-owned completion explanation. */
export const checkoutProcessClassName = cn("flex", "min-w-0", "flex-col", "gap-3")
/** Ordered consequences preserve sequence at every viewport. */
export const checkoutProcessListClassName = cn("ml-5", "list-decimal", "space-y-2", "marker:font-semibold", "marker:text-accent-soft-foreground")
/** Low-attention security boundary statement. */
export const checkoutTrustClassName = cn("rounded-lg", "border", "border-separator", "p-3")
/** One primary hand-off and one quiet escape, both full-width on compact surfaces. */
export const checkoutActionsClassName = cn("flex", "flex-col", "gap-2", "[&>*]:w-full")
