import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import {
    queryContentChallengeSubmissions,
    type ContentChallengeDraftSubmission,
} from "@/modules/api/graphql/queries/query-content-challenge-submissions"

/** Stable SWR cache identity for authored Challenge deliverables and learner drafts. */
export const QUERY_CONTENT_CHALLENGE_SUBMISSIONS_SWR_KEY = "QUERY_CONTENT_CHALLENGE_SUBMISSIONS_SWR"

/** Reads authored deliverables together with the caller's recoverable draft and latest attempt. */
export const useQueryContentChallengeSubmissionsSwr = (
    courseId?: string,
    challengeId?: string,
    realtimeConnected = false,
) => {
    const viewer = useViewerKey()
    return useSWR<ReadonlyArray<ContentChallengeDraftSubmission> | null>(
        courseId === undefined || challengeId === undefined || viewer === undefined
            ? null
            : [QUERY_CONTENT_CHALLENGE_SUBMISSIONS_SWR_KEY, courseId, challengeId, viewer],
        async () => {
            if (courseId === undefined || challengeId === undefined) return null
            const response = await queryContentChallengeSubmissions({
                request: { challengeId, filters: { sorts: [{ by: "createdAt", order: "ASC" }] } },
                headers: { "X-Course-Id": courseId },
            })
            return response.data?.challengeSubmissions.data?.data ?? null
        },
        {
            refreshInterval: (data) => !realtimeConnected && data?.some(
                (item) => item.userSubmission?.lastAttempt?.status === "evaluating",
            ) ? 3_000 : 0,
        },
    )
}
