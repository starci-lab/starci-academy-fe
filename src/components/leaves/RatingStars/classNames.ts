import { cn } from "@heroui/react"

/** Rating star half-fill anatomy. */
export const ratingHalfRootClassName = cn("relative", "block", "size-5")
/** Empty half layer. */
export const ratingHalfEmptyClassName = cn("absolute", "inset-0")
/** Filled half clipping layer. */
export const ratingHalfClipClassName = cn("absolute", "inset-y-0", "left-0", "block", "w-1/2", "overflow-hidden")
/** Filled half icon sizing. */
export const ratingHalfFilledClassName = cn("block", "size-5", "max-w-none")
/** Loading rating shape. */
export const ratingLoadingClassName = cn("h-5", "w-24", "animate-pulse", "rounded-full", "bg-default")
/** Rating package row styling. */
export const ratingStarsClassName = cn("leading-none")
