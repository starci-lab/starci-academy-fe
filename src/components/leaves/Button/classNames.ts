/** Colocated class name exports for Button. */
import { cn, skeletonVariants } from "@heroui/react"

/** Trailing glyph motion. */
export const buttonTrailingGlyphClassName = cn("transition-transform", "duration-200", "ease-out", "group-hover:translate-x-1", "motion-reduce:transition-none", "motion-reduce:group-hover:translate-x-0")
/** Active button group positioning. */
export const buttonActiveClassName = cn("group", "relative")
/** Loading skeleton paint. */
export const buttonLoadingClassName = skeletonVariants({ animationType: "shimmer" }).base({ className: cn("select-none", "text-transparent") })
