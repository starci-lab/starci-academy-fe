import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import {
    queryContentChallengeProgress,
    type ContentChallengeProgress,
} from "@/modules/api/graphql/queries/query-content-challenge-progress"

/** Stable SWR cache prefix for viewer challenge progress by course. */
export const QUERY_CONTENT_CHALLENGE_PROGRESS_SWR_KEY = "QUERY_CONTENT_CHALLENGE_PROGRESS_SWR"

/** Reads all challenge progress rows for one authenticated course viewer. */
export const useQueryContentChallengeProgressSwr = (courseId?: string) => {
    const viewer = useViewerKey()
    return useSWR<ReadonlyArray<ContentChallengeProgress> | null>(
        courseId === undefined || viewer === undefined
            ? null
            : [QUERY_CONTENT_CHALLENGE_PROGRESS_SWR_KEY, courseId, viewer],
        async () => {
            if (courseId === undefined) throw new Error("Course id not found")
            const result = await queryContentChallengeProgress({ request: { courseId } })
            return result.data?.challengeSubmissionProgress?.data?.completionTasks ?? null
        },
    )
}
