import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryMyMockInterviewAttempts, type MockInterviewAttemptsPage } from "../../modules/api/graphql/queries/query-my-mock-interview-attempts"

/** Cache family for completed interviews scoped to one viewer and course. */
export const QUERY_MY_MOCK_INTERVIEW_ATTEMPTS_SWR_KEY = "QUERY_MY_MOCK_INTERVIEW_ATTEMPTS_SWR"

/** Read the first history page for the current viewer and course. */
export const useQueryMyMockInterviewAttemptsSwr = (courseId?: string) => {
    const viewer = useViewerKey()
    return useSWR<MockInterviewAttemptsPage | null>(viewer === undefined || courseId === undefined
        ? null
        : [QUERY_MY_MOCK_INTERVIEW_ATTEMPTS_SWR_KEY, viewer, courseId, 10, 0], async () => {
        if (courseId === undefined) throw new Error("Course id not found")
        const result = await queryMyMockInterviewAttempts({ request: { courseId, limit: 10, offset: 0 }, headers: { "X-Course-Id": courseId } })
        return result.data?.myMockInterviewAttempts.data ?? null
    })
}
