import useSWRMutation from "swr/mutation"
import { mutationSyncMockInterviewSessionTurns, type SyncMockInterviewSessionTurnsRequest } from "../../modules/api/graphql/mutations/mutation-sync-mock-interview-session-turns"

/** Mutation family for persisting resumable interview progress. */
export const MUTATE_SYNC_MOCK_INTERVIEW_SESSION_TURNS_SWR_KEY = "MUTATE_SYNC_MOCK_INTERVIEW_SESSION_TURNS_SWR"
/** SWR trigger envelope for transcript persistence. */
export type SyncMockInterviewSessionTurnsTrigger = { readonly arg: SyncMockInterviewSessionTurnsRequest }

/** Persist transcript and cursor progress under the course enrollment guard. */
export const useMutateSyncMockInterviewSessionTurnsSwr = (courseId?: string, sessionId?: string) => useSWRMutation(
    courseId === undefined || sessionId === undefined
        ? null
        : [MUTATE_SYNC_MOCK_INTERVIEW_SESSION_TURNS_SWR_KEY, courseId, sessionId] as const,
    async (_key, { arg }: SyncMockInterviewSessionTurnsTrigger) => {
        if (courseId === undefined) throw new Error("Course id not found")
        return mutationSyncMockInterviewSessionTurns(arg, { headers: { "X-Course-Id": courseId } })
    },
)
