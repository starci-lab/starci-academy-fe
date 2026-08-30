import { cn } from "@heroui/react"

/** One shared measure aligns route context and the complete Mock Interview practice home. */
export const mockInterviewPageClassName = cn("mx-auto", "w-full", "max-w-6xl", "min-w-0", "px-4", "sm:px-6", "lg:px-8")
/** Breadcrumbs retain a small top breathing space without becoming a second page inset. */
export const mockInterviewBreadcrumbClassName = cn("pt-1")
/** Compact routes use one explicit course return instead of clipping a three-step trail. */
export const mockInterviewCompactBreadcrumbClassName = cn("block", "min-w-0", "sm:hidden")
/** The full route trail has enough room once the compact shell has widened. */
export const mockInterviewFullBreadcrumbClassName = cn("hidden", "min-w-0", "sm:block")
