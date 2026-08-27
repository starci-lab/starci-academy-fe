import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse } from "../types"
import type { MockInterviewMutationOptions } from "./mutation-start-mock-interview-session"

/** Optimistic command shared by terminal mock-interview lifecycle transitions. */
export type MockInterviewSessionLifecycleRequest = {
    readonly courseId: string
    readonly sessionId: string
    readonly expectedRevision: number
}

/** Optional model selection accepted only by the completion handoff. */
export type CompleteMockInterviewSessionRequest = MockInterviewSessionLifecycleRequest & {
    readonly selectedModel?: string
    readonly selectedModelProvider?: string
}

/** Authoritative state returned by completion and grading retry. */
export type MockInterviewGradingLifecycleData = {
    readonly sessionId: string
    readonly gradingJobId: string
    readonly status: string
    readonly revision: number
}

/** Authoritative state returned after explicit abandonment. */
export type AbandonMockInterviewSessionData = {
    readonly sessionId: string
    readonly status: string
    readonly revision: number
}

/** GraphQL envelope for the completion handoff. */
export type MutationCompleteMockInterviewSessionResponse = {
    readonly completeMockInterviewSession: GraphQLResponse<MockInterviewGradingLifecycleData>
}

/** GraphQL envelope for a bounded grading retry. */
export type MutationRetryMockInterviewSessionGradingResponse = {
    readonly retryMockInterviewSessionGrading: GraphQLResponse<MockInterviewGradingLifecycleData>
}

/** GraphQL envelope for explicit session abandonment. */
export type MutationAbandonMockInterviewSessionResponse = {
    readonly abandonMockInterviewSession: GraphQLResponse<AbandonMockInterviewSessionData>
}

/** Moves a synchronized live session into durable asynchronous grading. */
export const completeMockInterviewSessionDocument: DocumentNode = gql`
    mutation CompleteMockInterviewSession($request: CompleteMockInterviewSessionRequest!) {
        completeMockInterviewSession(request: $request) {
            success message error
            data { sessionId gradingJobId status revision }
        }
    }
`

/** Explicitly abandons an unfinished or terminally failed grading session. */
export const abandonMockInterviewSessionDocument: DocumentNode = gql`
    mutation AbandonMockInterviewSession($request: AbandonMockInterviewSessionRequest!) {
        abandonMockInterviewSession(request: $request) {
            success message error
            data { sessionId status revision }
        }
    }
`

/** Requeues a terminally failed grading job within its server-owned retry budget. */
export const retryMockInterviewSessionGradingDocument: DocumentNode = gql`
    mutation RetryMockInterviewSessionGrading($request: RetryMockInterviewSessionGradingRequest!) {
        retryMockInterviewSessionGrading(request: $request) {
            success message error
            data { sessionId gradingJobId status revision }
        }
    }
`

/** Execute the learner-owned completion handoff. */
export const mutationCompleteMockInterviewSession = async (
    request: CompleteMockInterviewSessionRequest,
    options: MockInterviewMutationOptions = {},
) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.mutate<MutationCompleteMockInterviewSessionResponse>({
        mutation: completeMockInterviewSessionDocument,
        variables: { request },
    })
}

/** Execute explicit abandonment for one learner-owned session. */
export const mutationAbandonMockInterviewSession = async (
    request: MockInterviewSessionLifecycleRequest,
    options: MockInterviewMutationOptions = {},
) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.mutate<MutationAbandonMockInterviewSessionResponse>({
        mutation: abandonMockInterviewSessionDocument,
        variables: { request },
    })
}

/** Requeue one terminally failed grading job. */
export const mutationRetryMockInterviewSessionGrading = async (
    request: MockInterviewSessionLifecycleRequest,
    options: MockInterviewMutationOptions = {},
) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.mutate<MutationRetryMockInterviewSessionGradingResponse>({
        mutation: retryMockInterviewSessionGradingDocument,
        variables: { request },
    })
}
