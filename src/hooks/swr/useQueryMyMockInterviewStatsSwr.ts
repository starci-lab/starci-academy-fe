import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryMyMockInterviewStats, type MockInterviewStats } from "../../modules/api/graphql/queries/query-my-mock-interview-stats"

/** Cache family for aggregate interview evidence scoped to one viewer and course. */
export const QUERY_MY_MOCK_INTERVIEW_STATS_SWR_KEY = "QUERY_MY_MOCK_INTERVIEW_STATS_SWR"

/** Read aggregate interview evidence for the current viewer and course. */
export const useQueryMyMockInterviewStatsSwr = (courseId?: string) => {
    const viewer = useViewerKey()
    return useSWR<MockInterviewStats | null>(viewer === undefined || courseId === undefined
        ? null
        : [QUERY_MY_MOCK_INTERVIEW_STATS_SWR_KEY, viewer, courseId], async () => {
        if (courseId === undefined) throw new Error("Course id not found")
        const result = await queryMyMockInterviewStats({ request: { courseId }, headers: { "X-Course-Id": courseId } })
        return result.data?.myMockInterviewStats.data ?? null
    })
}
