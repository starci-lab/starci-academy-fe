import { cn } from "@heroui/react"

/** Stacks profile tabs over the measured route body. */
export const profileTabsFrameClassName = cn("flex", "w-full", "flex-col")
/** Keeps profile content inside its wide legacy measure. */
export const profileMeasureClassName = cn("mx-auto", "w-full", "max-w-7xl")
/** Provides the profile page inset. */
export const profileInsetClassName = cn("p-6")
/** Responsive rail and main arrangement. */
export const profileSplitClassName = cn("flex", "w-full", "flex-col", "gap-6", "md:flex-row", "md:items-start", "md:gap-8")
/** Fixed-width identity rail that becomes full width on small screens. */
export const profileRailClassName = cn("flex", "w-full", "shrink-0", "flex-col", "md:w-72")
