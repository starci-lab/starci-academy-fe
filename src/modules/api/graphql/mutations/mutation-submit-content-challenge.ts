import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { MutationParams } from "./types/params"
import type { GraphQLResponse } from "../types"

/** Backend-proven grading request for one authored challenge-submission row. */
export interface SubmitContentChallengeRequest {
    readonly challengeSubmissionId: string
    readonly deliverables?: ReadonlyArray<{
        readonly challengeSubmissionId: string
        readonly idempotencyKey: string
    }>
    readonly githubUrl?: string
    readonly selectedModel?: string
    readonly selectedModelProvider?: string
    readonly lang?: string
    readonly idempotencyKey?: string
    readonly attemptGroupId?: string
}

/** Async grading job identity returned after a challenge submission is accepted. */
export interface SubmitContentChallengeResult {
    readonly jobId: string
    readonly attemptId: string
    readonly attemptGroupId?: string
    readonly items?: ReadonlyArray<{
        readonly challengeSubmissionId: string
        readonly jobId: string
        readonly attemptId: string
    }>
}

/** GraphQL envelope returned by the challenge-submission mutation. */
export interface MutationSubmitContentChallengeResponse {
    readonly submitChallengeSubmission: GraphQLResponse<SubmitContentChallengeResult>
}

const mutation1 = gql`
    mutation SubmitChallengeSubmission($request: SubmitChallengeSubmissionRequest!) {
        submitChallengeSubmission(request: $request) {
            success
            message
            error
            data {
                jobId attemptId attemptGroupId
                items { challengeSubmissionId jobId attemptId }
            }
        }
    }
`

/** Selects content-challenge submission in the shared GraphQL executor. */
export enum MutationSubmitContentChallenge { Mutation1 = "mutation1" }

/** Every supported challenge-submission document keyed by its finite variant. */
export const mutationSubmitContentChallengeMap: Record<MutationSubmitContentChallenge, DocumentNode> = {
    [MutationSubmitContentChallenge.Mutation1]: mutation1,
}

/** Enqueues grading for one approved challenge-submission row. */
export const mutationSubmitContentChallenge = async ({
    mutation = MutationSubmitContentChallenge.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationSubmitContentChallenge, SubmitContentChallengeRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.mutate<MutationSubmitContentChallengeResponse>({
        mutation: mutationSubmitContentChallengeMap[mutation],
        variables: { request },
    })
}
