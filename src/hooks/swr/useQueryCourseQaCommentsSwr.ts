import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import {
    queryCourseQaComments,
    type CourseQaCommentsPage,
} from "@/modules/api/graphql/queries/query-course-qa-comments"

const QUERY_COURSE_QA_COMMENTS_SWR_KEY = "QUERY_COURSE_QA_COMMENTS_SWR"

interface UseQueryCourseQaCommentsSwrParams {
    readonly courseId?: string
    readonly parentCommentId?: string | null
    readonly page?: number
    readonly limit?: number
}

/** Reads course questions or one question's direct replies with every scope field in the key. */
export const useQueryCourseQaCommentsSwr = ({
    courseId,
    parentCommentId = null,
    page = 1,
    limit = 20,
}: UseQueryCourseQaCommentsSwrParams = {}) => {
    const viewer = useViewerKey()
    const hasScope = parentCommentId !== null || courseId !== undefined
    return useSWR<CourseQaCommentsPage | null>(
        !hasScope || viewer === undefined
            ? null
            : [QUERY_COURSE_QA_COMMENTS_SWR_KEY, courseId, parentCommentId, page, limit, viewer],
        async () => {
            const request = parentCommentId === null
                ? { courseId, parentCommentId, page, limit }
                : { parentCommentId, page, limit }
            const result = await queryCourseQaComments({ request })
            return result.data?.contentComments?.data ?? null
        },
    )
}
