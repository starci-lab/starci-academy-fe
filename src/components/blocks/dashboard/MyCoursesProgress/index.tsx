"use client"

import { useQueryMyCoursesSwr } from "@/hooks"
import { type MyCourseRow } from "@/modules/api/graphql/queries/types/my-courses"
import {
    _MyCoursesProgress,
    type MyCoursesProgressCourse,
    type MyCoursesProgressLabels,
} from "./component"

/**
 * BLOCK - `MyCoursesProgress`, connected half.
 *
 * Reads the enrolled-courses request and resolves each row into strings. The
 * distinction it owns is the one nothing downstream can make: a list that is empty
 * because the learner has enrolled in nothing, versus a list that is empty because
 * the request has not come back.
 */

/*
 * The payload shape is NOT restated here. This file used to declare its own `MyCoursesLeaf`
 * and `CourseSlice` and then double-cast the hook onto them, which meant the query could
 * rename a field and this block would still compile and render `undefined`. It now reads
 * `MyCourseRow` - the type the query itself publishes - so the seam is checked.
 */

/** Copy that does not depend on the payload. */
const STATIC_LABELS = {
    heading: "My courses",
    loading: "Loading",
    empty: "You have not enrolled in a course yet",
}

/**
 * Clamp a completion figure into the range a progress element accepts. A payload that
 * reports 104 percent is a bug somewhere upstream, but it must not render as a bar
 * wider than its own track.
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
const toCourseRow = (course: MyCourseRow): MyCoursesProgressCourse => {
    const percent = clampPercent(course.completionPercent)
    return {
        id: course.globalId,
        title: course.label,
        percent,
        percentText: `${percent}%`,
    }
}

/**
 * Resolve the copy for a settled payload.
 *
 * @param count - How many courses the learner is enrolled in.
 */
const toLabels = (count: number): MyCoursesProgressLabels => ({
    ...STATIC_LABELS,
    count: count === 1 ? "1 course" : `${count} courses`,
})

/**
 * Fetch the enrolled courses and render them.
 */
export const MyCoursesProgress = () => {
    const enrolled = useQueryMyCoursesSwr()
    const courses = (enrolled.data ?? []).map(toCourseRow)

    // Rests only on a FIRST load: once anything is in hand the list shows it, so a
    // refetch never blanks a list the reader was already reading.
    const isLoading = courses.length === 0 && enrolled.isLoading === true

    return (
        <_MyCoursesProgress
            isLoading={isLoading}
            isEmpty={courses.length === 0}
            courses={courses}
            labels={toLabels(courses.length)}
        />
    )
}
