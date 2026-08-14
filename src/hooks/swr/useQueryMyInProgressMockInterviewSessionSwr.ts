import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryMyInProgressMockInterviewSession, type InProgressMockInterviewSession } from "../../modules/api/graphql/queries/query-my-in-progress-mock-interview-session"

/** Cache family for the viewer's resumable interview in one course. */
export const QUERY_MY_IN_PROGRESS_MOCK_INTERVIEW_SESSION_SWR_KEY = "QUERY_MY_IN_PROGRESS_MOCK_INTERVIEW_SESSION_SWR"

/** Resolve the authenticated viewer's current resumable interview, if one exists. */
export const useQueryMyInProgressMockInterviewSessionSwr = (courseId?: string) => {
    const viewer = useViewerKey()
    return useSWR<InProgressMockInterviewSession | null>(
        viewer === undefined || courseId === undefined
            ? null
            : [QUERY_MY_IN_PROGRESS_MOCK_INTERVIEW_SESSION_SWR_KEY, viewer, courseId],
        async () => {
            if (courseId === undefined) throw new Error("Course id not found")
            const result = await queryMyInProgressMockInterviewSession({
                request: { courseId },
                headers: { "X-Course-Id": courseId },
            })
            return result.data?.myInProgressMockInterviewSession?.data ?? null
        },
    )
}
