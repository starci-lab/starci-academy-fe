import { cn } from "@heroui/react"

/** Stacks profile tabs over the measured route body. */
export const profileTabsFrameClassName = cn("flex", "w-full", "flex-col")
/** Keeps profile content inside its wide legacy measure. */
export const profileMeasureClassName = cn("@container", "mx-auto", "w-full", "max-w-app-xl")
/** Provides the profile page inset. */
export const profileInsetClassName = cn("p-4", "@app-md:p-6")
/** Keeps identity and route evidence in one deliberate reading flow. */
export const profileContentStackClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-6")
/** Full-width identity owner above the overview evidence grid. */
export const profileIdentityClassName = cn("w-full", "min-w-0")
/** Flexible route body; min-width prevents evidence surfaces from widening the page. */
export const profileBodyClassName = cn("w-full", "min-w-0")
/** Bounded screen-level recovery/empty surface. */
export const profileStateClassName = cn("mx-auto", "w-full", "max-w-app-xl", "p-6")
