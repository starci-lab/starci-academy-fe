import { cn } from "@heroui/react"

/** Wide management surface keeps empty course evidence dense and purposeful. */
export const profileChallengeManageClassName = cn("flex", "w-full", "min-w-0", "flex-col", "gap-4", "@app-lg:mx-auto", "@app-lg:max-w-4xl")
/** Search and filter form a composed control row with a full-size touch target. */
export const profileChallengeManageControlsClassName = cn("flex", "min-w-0", "flex-wrap", "items-end", "gap-3", "@app-sm:flex-nowrap")
/** Search owns the available width while the filter remains readable. */
export const profileChallengeManageSearchClassName = cn("min-w-0", "flex-1")
