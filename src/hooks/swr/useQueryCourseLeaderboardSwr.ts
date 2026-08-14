import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import {
    queryCourseLeaderboard,
    type CourseLeaderboard,
} from "@/modules/api/graphql/queries/query-course-leaderboard"

const QUERY_COURSE_LEADERBOARD_SWR_KEY = "QUERY_COURSE_LEADERBOARD_SWR"

/** Reads one viewer-scoped course leaderboard without leaking it across sessions. */
export const useQueryCourseLeaderboardSwr = (courseId?: string) => {
    const viewer = useViewerKey()
    return useSWR<CourseLeaderboard | null>(
        courseId === undefined || viewer === undefined
            ? null
            : [QUERY_COURSE_LEADERBOARD_SWR_KEY, courseId, viewer],
        async () => {
            if (courseId === undefined) throw new Error("Course id not found")
            const result = await queryCourseLeaderboard({ request: { courseId, limit: 100 } })
            return result.data?.courseLeaderboard?.data ?? null
        },
    )
}
