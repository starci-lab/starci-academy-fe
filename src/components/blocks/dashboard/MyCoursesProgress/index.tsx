"use client"

import { useQueryMyCoursesSwr } from "@/hooks"
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

/** The part of the enrolled-courses request this block reads. */
interface MyCoursesLeaf {
    /** The settled payload, absent until it arrives. */
    data?: CourseSlice[]
    /** True while the first request is still in flight. */
    isLoading?: boolean
}

/** The course fields this block reads. */
interface CourseSlice {
    /** Opaque id of the course. */
    globalId: string
    /** Course title. */
    label: string
    /** Overall completion, 0 to 100. */
    completionPercent: number
}

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
const toCourseRow = (course: CourseSlice): MyCoursesProgressCourse => {
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
    const enrolled = useQueryMyCoursesSwr() as unknown as MyCoursesLeaf
    const courses = (enrolled.data ?? []).map(toCourseRow)

    // Rests only on a FIRST load: once anything is in hand the list shows it, so a
    // refetch never blanks a list the reader was already reading.
    const isSkeleton = courses.length === 0 && enrolled.isLoading === true

    return (
        <_MyCoursesProgress
            isSkeleton={isSkeleton}
            isEmpty={courses.length === 0}
            courses={courses}
            labels={toLabels(courses.length)}
        />
    )
}
