"use client"

import { useSearchParams } from "next/navigation"
import { CourseLeaderboardPageBase, type CourseLeaderboardCategory } from "./component"

interface CourseLeaderboardPageRouteProps { readonly displayId: string }
const CATEGORIES: ReadonlyArray<CourseLeaderboardCategory> = ["total", "challenge", "reading", "milestone"]

/** Resolve route identity only; the connected block owns all rendered data and interactions. */
export const CourseLeaderboardPage = ({ displayId }: CourseLeaderboardPageRouteProps) => {
    const categoryParam = useSearchParams().get("category")
    const category: CourseLeaderboardCategory = CATEGORIES.some((item) => item === categoryParam) ? categoryParam as CourseLeaderboardCategory : "total"
    return <CourseLeaderboardPageBase displayId={displayId} selectedCategory={category} />
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
