import { cn } from "@heroui/react"
import { formScrollViewportClassName } from "@starci/grammar/core"

/** Grammar-owned viewport selected for a compact form surface. */
export const authenticationFormScrollViewportClassName = cn(formScrollViewportClassName)

/** Bounded pricing content viewport; HeroUI ScrollShadow owns scrolling and edge cues. */
export const pricingRailScrollViewportClassName = cn("min-h-0", "max-h-[var(--max-height-pricing-rail)]", "overscroll-contain")
/** The assistant owns one bounded transcript; composer and panel chrome remain fixed peers. */
export const aiTranscriptScrollViewportClassName = cn("h-full", "min-h-0", "overscroll-contain")
/** Course navigation keeps its chrome still while Home and every destination own a definite scroll box. */
export const learnNavigationGroupsScrollViewportClassName = cn("h-0", "min-h-0", "max-h-full", "w-full", "min-w-0", "flex-1", "overflow-y-auto", "overscroll-contain", "touch-pan-y")
