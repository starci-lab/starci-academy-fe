/** Colocated class name exports for Link. */
import { cn } from "@heroui/react"

/** Link emphasis recipes. */
export const linkEmphasisClassNames = {
    default: cn("inline-flex", "items-center", "gap-2", "text-sm"),
    muted: cn("inline-flex", "items-center", "gap-2", "text-sm", "text-muted"),
    brand: cn("inline-flex", "items-center", "gap-2", "text-foreground", "no-underline"),
} as const
/** Brand mark dimensions. */
export const linkBrandMarkClassName = cn("h-10", "w-auto", "shrink-0")
/** Brand lockup layout. */
export const linkBrandTextClassName = cn("flex", "flex-col", "leading-none")
/** Brand name typography. */
export const linkBrandNameClassName = cn("text-sm", "font-semibold", "leading-none", "text-foreground")
/** Brand suffix typography. */
export const linkBrandSuffixClassName = cn("text-[8px]", "uppercase", "leading-none", "text-muted")
