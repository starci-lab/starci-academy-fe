import { cn } from "@heroui/react"

/** Arrange resumable learning cards without constraining their content width. */
export const continueLearningGridClassName = cn("grid", "min-w-0", "items-stretch", "gap-2", "md:grid-cols-2", "xl:grid-cols-3")

/** The first resumable item is the focal task; later items remain useful but quieter. */
export const continueLearningItemClassName = cn(
    "min-w-0",
    "h-full",
)

/** Arrange the featured mark, title, and route as one clear resume decision. */
export const continueLearningFeaturedContentClassName = cn("grid", "min-w-0", "grid-cols-[auto_1fr]", "gap-3", "items-start")

/** Compact supporting items keep their content readable without competing with the lead. */
export const continueLearningCompactContentClassName = cn("grid", "min-w-0", "grid-cols-[auto_1fr]", "gap-2", "items-start")

/** Separate the destination identity from its action boundary. */
export const continueLearningCopyClassName = cn("flex", "min-w-0", "flex-col", "gap-3")

/** Keep the supporting kind close to the destination title it qualifies. */
export const continueLearningIdentityClassName = cn("flex", "min-w-0", "flex-col", "gap-1")
