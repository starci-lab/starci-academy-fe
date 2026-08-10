"use client"

import { useTranslations } from "next-intl"
import { useQueryMyCoursesSwr } from "@/hooks"
import { type MyCourseRow } from "@/modules/api/graphql/queries/types/my-courses"
import { _MyCoursesProgress } from "./component"
import type { LabelledProgressRowData } from "@/components/leaves/LabelledProgressRow"

/**
 * BLOCK - `MyCoursesProgress`, connected half.
 *
 * It reads ONE request and settles ONE state. The distinction it owns is the one nothing
 * downstream can make: a list empty because the learner enrolled in nothing, versus a list empty
 * because the request has not come back.
 */

/**
 * Clamp a completion figure into the range a bar accepts. A payload reporting 104 percent is a bug
 * upstream, but it must not render as a bar wider than its own track.
 *
 * @param percent - The reported completion figure.
 */
const clampPercent = (percent: number): number => {
    if (!Number.isFinite(percent)) return 0
    return Math.min(100, Math.max(0, Math.round(percent)))
}

/**
 * Resolve one payload course into a rendered row.
 *
 * @param course - One course of the payload.
 */
const toRow = (course: MyCourseRow): LabelledProgressRowData => {
    const percent = clampPercent(course.completionPercent)
    return { id: course.globalId, title: course.label, percent, percentText: `${percent}%` }
}

/**
 * Fetch the enrolled courses and render them.
 */
export const MyCoursesProgress = () => {
    const t = useTranslations("courses")
    const enrolled = useQueryMyCoursesSwr()
    const label = t("heading")
    const retryLabel = t("retry")

    // The way out of an empty list is SWR's own revalidation rather than a page reload, because
    // the commonest reason this list is empty is a backend that answered before its data was
    // there - and a reader should not have to throw the whole page away to ask again.
    const retry = () => {
        void enrolled.mutate()
    }

    if (enrolled.error !== undefined && enrolled.error !== null) {
        return (
            <_MyCoursesProgress
                state="failed"
                props={{ label, message: t("failed"), retryLabel }}
                on={{ retry }}
            />
        )
    }

    const rows = (enrolled.data ?? []).map(toRow)
    if (rows.length === 0 && enrolled.isLoading === true) {
        return <_MyCoursesProgress state="pending" props={{ label }} />
    }
    if (rows.length === 0) {
        return (
            <_MyCoursesProgress
                state="empty"
                props={{ label, message: t("empty"), retryLabel }}
                on={{ retry }}
            />
        )
    }

    return (
        <_MyCoursesProgress
            state="ready"
            props={{ label, count: t("count", { count: rows.length }), rows }}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "courses" } as const
