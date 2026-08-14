import useSWRMutation from "swr/mutation"
import { mutationGradeMockInterviewSession, type GradeMockInterviewSessionRequest } from "../../modules/api/graphql/mutations/mutation-grade-mock-interview-session"

/** Mutation family for final interview grading. */
export const MUTATE_GRADE_MOCK_INTERVIEW_SESSION_SWR_KEY = "MUTATE_GRADE_MOCK_INTERVIEW_SESSION_SWR"
/** SWR trigger envelope for a grading request. */
export type GradeMockInterviewSessionTrigger = { readonly arg: GradeMockInterviewSessionRequest }

/** Grade one durable interview under the owning course's enrollment guard. */
export const useMutateGradeMockInterviewSessionSwr = (courseId?: string, sessionId?: string) => useSWRMutation(
    courseId === undefined || sessionId === undefined
        ? null
        : [MUTATE_GRADE_MOCK_INTERVIEW_SESSION_SWR_KEY, courseId, sessionId] as const,
    async (_key, { arg }: GradeMockInterviewSessionTrigger) => {
        if (courseId === undefined) throw new Error("Course id not found")
        return mutationGradeMockInterviewSession(arg, { headers: { "X-Course-Id": courseId } })
    },
)
