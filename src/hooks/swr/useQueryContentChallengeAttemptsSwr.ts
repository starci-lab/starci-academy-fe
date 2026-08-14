import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import { SortOrder } from "@/modules/api/graphql/types"
import {
    queryContentChallengeAttempts,
    type ContentChallengeAttempt,
} from "@/modules/api/graphql/queries/query-content-challenge-attempts"

/** Stable SWR cache prefix for one challenge deliverable's result attempts. */
export const QUERY_CONTENT_CHALLENGE_ATTEMPTS_SWR_KEY = "QUERY_CONTENT_CHALLENGE_ATTEMPTS_SWR"

/** Reads newest attempts and polls while the grading result has not settled. */
export const useQueryContentChallengeAttemptsSwr = (courseId?: string, submissionId?: string) => {
    const viewer = useViewerKey()
    return useSWR<ReadonlyArray<ContentChallengeAttempt> | null>(
        courseId === undefined || submissionId === undefined || viewer === undefined
            ? null
            : [QUERY_CONTENT_CHALLENGE_ATTEMPTS_SWR_KEY, courseId, submissionId, viewer],
        async () => {
            if (courseId === undefined || submissionId === undefined) {
                throw new Error("Course or challenge submission id not found")
            }
            const result = await queryContentChallengeAttempts({
                request: {
                    challengeSubmissionId: submissionId,
                    filters: {
                        pageNumber: 0,
                        limit: 50,
                        sorts: [{ by: "attemptNumber", order: SortOrder.Desc }],
                    },
                },
                headers: { "X-Course-Id": courseId },
            })
            return result.data?.userChallengeSubmissionAttempts?.data?.data ?? null
        },
        {
            refreshInterval: (attempts) => attempts === null
                || attempts === undefined
                || attempts.length === 0
                || attempts.some((attempt) => attempt.processedAt === null)
                ? 2_000
                : 0,
        },
    )
}
