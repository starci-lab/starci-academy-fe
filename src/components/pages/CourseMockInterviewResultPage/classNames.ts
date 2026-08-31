import { cn } from "@heroui/react"

/** Bound the result journey to the page-owned reading width and responsive gutters. */
export const mockInterviewResultPageClassName = cn("mx-auto", "w-full", "max-w-[96rem]", "min-w-0", "px-4", "sm:px-6", "lg:px-8")
/** Separate the route breadcrumb from the debrief composition without owning shell spacing. */
export const mockInterviewResultBreadcrumbClassName = cn("pt-1")
