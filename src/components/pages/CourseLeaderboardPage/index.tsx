"use client"

import { useSearchParams } from "next/navigation"
import { CourseLeaderboardPageBase, type CourseLeaderboardCategory } from "./component"

type CourseLeaderboardPageProps = { readonly displayId: string }
const CATEGORIES: ReadonlyArray<CourseLeaderboardCategory> = ["total", "challenge", "reading", "milestone"]

/** Resolve route identity only; the connected block owns all rendered data and interactions. */
export const CourseLeaderboardPage = (props: CourseLeaderboardPageProps) => {
    const { displayId } = props
    const categoryParam = useSearchParams().get("category")
    const category: CourseLeaderboardCategory = CATEGORIES.some((item) => item === categoryParam) ? categoryParam as CourseLeaderboardCategory : "total"
    return <CourseLeaderboardPageBase displayId={displayId} selectedCategory={category} />
}
