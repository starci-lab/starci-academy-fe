import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import { queryCourseOutline } from "@/modules/api/graphql/queries/query-course-outline"
import type { CourseOutline } from "@/modules/api/graphql/queries/types/course-outline"

/** Stable cache prefix for one viewer's course outline. */
export const QUERY_COURSE_OUTLINE_SWR_KEY = "QUERY_COURSE_OUTLINE_SWR"

type CourseOutlineKey = readonly [typeof QUERY_COURSE_OUTLINE_SWR_KEY, string, string]

/** Read one viewer-specific course outline after both viewer and display id resolve. */
export const useQueryCourseOutlineSwr = (displayId?: string) => {
    const viewer = useViewerKey()
    const key: CourseOutlineKey | null = displayId === undefined || viewer === undefined
        ? null
        : [QUERY_COURSE_OUTLINE_SWR_KEY, viewer, displayId]

    return useSWR<CourseOutline | null, Error, CourseOutlineKey | null>(
        key,
        async ([, , requestedDisplayId]) => queryCourseOutline(requestedDisplayId),
    )
}
