import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryMockInterviewAttemptBySession, type MockInterviewAttempt } from "../../modules/api/graphql/queries/query-mock-interview-attempt-by-session"

/** Cache family for URL-addressable graded interview attempts. */
export const QUERY_MOCK_INTERVIEW_ATTEMPT_BY_SESSION_SWR_KEY = "QUERY_MOCK_INTERVIEW_ATTEMPT_BY_SESSION_SWR"

/** Resolve and optionally poll one authenticated viewer-owned graded attempt. */
export const useQueryMockInterviewAttemptBySessionSwr = (courseId?: string, sessionId?: string, refreshInterval = 0) => {
    const viewer = useViewerKey()
    return useSWR<MockInterviewAttempt | null>(
        viewer === undefined || courseId === undefined || sessionId === undefined
            ? null
            : [QUERY_MOCK_INTERVIEW_ATTEMPT_BY_SESSION_SWR_KEY, viewer, courseId, sessionId],
        async () => {
            if (courseId === undefined || sessionId === undefined) throw new Error("Session id not found")
            const result = await queryMockInterviewAttemptBySession({
                request: { courseId, sessionId },
                headers: { "X-Course-Id": courseId },
            })
            return result.data?.myMockInterviewAttemptBySessionId?.data ?? null
        },
        { refreshInterval },
    )
}
