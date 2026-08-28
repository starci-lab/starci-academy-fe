import { cn } from "@heroui/react"
import { formScrollViewportClassName } from "@starci/grammar/core"

/** Grammar-owned viewport selected for a compact form surface. */
export const authenticationFormScrollViewportClassName = cn(formScrollViewportClassName)

/** Bounded pricing content viewport used inside the pricing rail card. */
export const pricingRailScrollViewportClassName = cn("min-h-0", "max-h-[var(--max-height-pricing-rail)]", "overflow-y-auto")
