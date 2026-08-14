import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import { SortOrder } from "@/modules/api/graphql/types"
import {
    queryContentChallengeFeedbacks,
    type ContentChallengeFeedback,
} from "@/modules/api/graphql/queries/query-content-challenge-feedbacks"

/** Stable SWR cache prefix for scorer findings by challenge attempt. */
export const QUERY_CONTENT_CHALLENGE_FEEDBACKS_SWR_KEY = "QUERY_CONTENT_CHALLENGE_FEEDBACKS_SWR"

/** Reads scorer feedback in backend-authored display order. */
export const useQueryContentChallengeFeedbacksSwr = (courseId?: string, attemptId?: string) => {
    const viewer = useViewerKey()
    return useSWR<ReadonlyArray<ContentChallengeFeedback> | null>(
        courseId === undefined || attemptId === undefined || viewer === undefined
            ? null
            : [QUERY_CONTENT_CHALLENGE_FEEDBACKS_SWR_KEY, courseId, attemptId, viewer],
        async () => {
            if (courseId === undefined || attemptId === undefined) {
                throw new Error("Course or challenge attempt id not found")
            }
            const result = await queryContentChallengeFeedbacks({
                request: {
                    submissionAttemptId: attemptId,
                    filters: {
                        pageNumber: 0,
                        limit: 100,
                        sorts: [{ by: "sortIndex", order: SortOrder.Asc }],
                    },
                },
                headers: { "X-Course-Id": courseId },
            })
            return result.data?.userChallengeSubmissionFeedbacks?.data?.data ?? null
        },
    )
}
