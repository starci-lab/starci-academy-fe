import useSWRMutation from "swr/mutation"
import { mutationStartMockInterviewSession, type StartMockInterviewSessionRequest } from "../../modules/api/graphql/mutations/mutation-start-mock-interview-session"

/** Mutation family for drawing a new durable interview session. */
export const MUTATE_START_MOCK_INTERVIEW_SESSION_SWR_KEY = "MUTATE_START_MOCK_INTERVIEW_SESSION_SWR"
/** SWR trigger envelope for the start request. */
export type StartMockInterviewSessionTrigger = { readonly arg: StartMockInterviewSessionRequest }

/** Start an enrolled course's interview with its enrollment guard header. */
export const useMutateStartMockInterviewSessionSwr = (courseId?: string) => useSWRMutation(
    courseId === undefined ? null : [MUTATE_START_MOCK_INTERVIEW_SESSION_SWR_KEY, courseId] as const,
    async (_key, { arg }: StartMockInterviewSessionTrigger) => {
        if (courseId === undefined) throw new Error("Course id not found")
        return mutationStartMockInterviewSession(arg, { headers: { "X-Course-Id": courseId } })
    },
)
