import { cn } from "@heroui/react"

/** Use the recommendation surface width for scan-friendly peer comparison. */
export const recommendedCoursesGridClassName = cn(
    "grid",
    "min-w-0",
    "grid-cols-1",
    "list-none",
    "p-0",
)

/** Hover treatment for the nested press target; RecommendedCourseRow owns its own width/wrap chain (min-w-0 at every grid/flex level). */
export const recommendedCourseCompactItemClassName = cn(
    "transition-colors",
    "hover:bg-accent/5",
)

/** Give every recommendation one full-width joined row with no orphan exception. */
export const recommendedCourseItemClassName = (index: number, itemCount: number) => {
    void index
    void itemCount
    return cn(
        "min-w-0",
        "border-b",
        "border-separator",
        "px-4",
        "py-3",
        "first:pt-4",
        "last:pb-4",
        "last:border-b-0",
        recommendedCourseCompactItemClassName,
    )
}
