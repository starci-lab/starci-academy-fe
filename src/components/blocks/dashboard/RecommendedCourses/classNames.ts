import { cn } from "@heroui/react"

/** Use the recommendation surface width for scan-friendly peer comparison. */
export const recommendedCoursesGridClassName = cn(
    "grid",
    "min-w-0",
    "grid-cols-1",
    "list-none",
    "p-0",
)

/** Keep the nested press target and every compact commerce fact inside a 390px card. */
export const recommendedCourseCompactItemClassName = cn(
    "transition-colors",
    "hover:bg-accent/5",
    "[&>button]:min-w-0",
    "[&>button>div]:min-w-0",
    "[&_[data-size=md]]:max-w-full",
    "[&_[data-size=md]]:break-words",
    "[&_[data-size=sm]]:max-w-full",
    "[&_[data-size=sm]]:break-words",
    "[&_[data-size=sm]]:whitespace-normal",
)

/** Give every recommendation one full-width joined row with no orphan exception. */
export const recommendedCourseItemClassName = (index: number, itemCount: number) => {
    void index
    void itemCount
    return cn(
        "min-w-0",
        "border-b",
        "border-separator",
        "p-3",
        "sm:p-4",
        "last:border-b-0",
        recommendedCourseCompactItemClassName,
    )
}
