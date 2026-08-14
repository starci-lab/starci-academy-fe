import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import { queryCoursePersonalProject } from "@/modules/api/graphql/queries/query-course-personal-project"
import type { CoursePersonalProject } from "@/modules/api/graphql/queries/types/course-personal-project"

/** Stable cache prefix for one viewer's course personal-project outline. */
export const QUERY_COURSE_PERSONAL_PROJECT_SWR_KEY = "QUERY_COURSE_PERSONAL_PROJECT_SWR"

/** Reads the authenticated viewer's personal-project outline for a course display id. */
export const useQueryCoursePersonalProjectSwr = (displayId?: string) => {
    const viewer = useViewerKey()
    return useSWR<CoursePersonalProject | null>(
        displayId === undefined || viewer === undefined
            ? null
            : [QUERY_COURSE_PERSONAL_PROJECT_SWR_KEY, viewer, displayId],
        async () => queryCoursePersonalProject(displayId ?? ""),
    )
}
