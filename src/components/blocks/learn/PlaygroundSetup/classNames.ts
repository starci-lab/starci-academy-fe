import { cn } from "@heroui/react"

/** Selected-lab identity, preparation sequence, and pairing workspace. */
export const playgroundSetupClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-8")
/** Keep selected-lab context close to the preparation workspace. */
export const playgroundSetupHeaderClassName = cn("flex", "max-w-3xl", "flex-col", "gap-3")
/** Stack setup on compact screens and pair instructions with connection state when wide. */
export const playgroundSetupGridClassName = cn("grid", "w-full", "min-w-0", "grid-cols-1", "items-start", "gap-6", "xl:grid-cols-2")
/** Provide one calm reading column for preparation steps. */
export const playgroundPreparationClassName = cn("flex", "flex-col", "gap-5", "p-5", "sm:p-6")
/** Keep each step number aligned with wrapping instructional copy. */
export const playgroundPreparationStepClassName = cn("flex", "items-start", "gap-4")
/** Keep connection feedback and its primary action within one boundary. */
export const playgroundPairingClassName = cn("flex", "min-h-64", "flex-col", "justify-between", "gap-6", "p-5", "sm:p-6")
/** Distinguish the server-issued pairing code from surrounding guidance. */
export const playgroundPairingCodeClassName = cn("rounded-xl", "border", "border-divider", "bg-content2", "px-4", "py-5", "font-mono", "tracking-[0.18em]")
