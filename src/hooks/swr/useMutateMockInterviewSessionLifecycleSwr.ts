import useSWRMutation from "swr/mutation"
import {
    mutationAbandonMockInterviewSession,
    mutationCompleteMockInterviewSession,
    mutationRetryMockInterviewSessionGrading,
    type CompleteMockInterviewSessionRequest,
    type MockInterviewSessionLifecycleRequest,
} from "@/modules/api/graphql/mutations/mutation-mock-interview-session-lifecycle"

type CompleteMutationArg = { readonly arg: CompleteMockInterviewSessionRequest }
type LifecycleMutationArg = { readonly arg: MockInterviewSessionLifecycleRequest }

/** Stable cache family for the live-room completion handoff. */
export const MUTATE_COMPLETE_MOCK_INTERVIEW_SESSION_SWR_KEY = "MUTATE_COMPLETE_MOCK_INTERVIEW_SESSION_SWR"
/** Stable cache family for explicit unfinished-session abandonment. */
export const MUTATE_ABANDON_MOCK_INTERVIEW_SESSION_SWR_KEY = "MUTATE_ABANDON_MOCK_INTERVIEW_SESSION_SWR"
/** Stable cache family for bounded grading recovery. */
export const MUTATE_RETRY_MOCK_INTERVIEW_GRADING_SWR_KEY = "MUTATE_RETRY_MOCK_INTERVIEW_GRADING_SWR"

const mutationKey = (family: string, courseId?: string, sessionId?: string) => (
    courseId === undefined || sessionId === undefined ? null : [family, courseId, sessionId] as const
)

/** Completes one synchronized interview and creates its durable grading job. */
export const useMutateCompleteMockInterviewSessionSwr = (courseId?: string, sessionId?: string) => useSWRMutation(
    mutationKey(MUTATE_COMPLETE_MOCK_INTERVIEW_SESSION_SWR_KEY, courseId, sessionId),
    async (_key, { arg }: CompleteMutationArg) => mutationCompleteMockInterviewSession(arg, {
        headers: { "X-Course-Id": arg.courseId },
    }),
)

/** Abandons one learner-owned unfinished interview. */
export const useMutateAbandonMockInterviewSessionSwr = (courseId?: string, sessionId?: string) => useSWRMutation(
    mutationKey(MUTATE_ABANDON_MOCK_INTERVIEW_SESSION_SWR_KEY, courseId, sessionId),
    async (_key, { arg }: LifecycleMutationArg) => mutationAbandonMockInterviewSession(arg, {
        headers: { "X-Course-Id": arg.courseId },
    }),
)

/** Retries one terminally failed grading job without creating a new session. */
export const useMutateRetryMockInterviewSessionGradingSwr = (courseId?: string, sessionId?: string) => useSWRMutation(
    mutationKey(MUTATE_RETRY_MOCK_INTERVIEW_GRADING_SWR_KEY, courseId, sessionId),
    async (_key, { arg }: LifecycleMutationArg) => mutationRetryMockInterviewSessionGrading(arg, {
        headers: { "X-Course-Id": arg.courseId },
    }),
)
