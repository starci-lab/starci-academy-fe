import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse, LookupQueryParams, PaginationFilters } from "../types"

/** One persisted grading attempt for a challenge deliverable. */
export interface ContentChallengeAttempt {
    readonly id: string
    readonly attemptGroupId: string | null
    readonly attemptNumber: number
    readonly score: number | null
    readonly shortFeedback: string | null
    readonly processedAt: string | null
    readonly submissionUrl: string
    readonly servedModel: string | null
    readonly servedProvider: string | null
    readonly evaluationJobId: string | null
    readonly status: "evaluating" | "passed" | "needs_revision" | "evaluation_unavailable" | "completed"
    readonly draftRevision: number
    readonly submittedAt: string
    readonly updatedAt: string
    readonly platformDecision: "passed" | "needs_revision" | null
    readonly confidence: number | null
    readonly uncertainty: string | null
    readonly nextAction: string | null
    readonly finalizationRevision: number
}

/** Sort keys accepted by the challenge-attempt list. */
export type ContentChallengeAttemptSortBy = "score" | "attemptNumber" | "createdAt" | "updatedAt" | "processedAt"

/** Scope and page window for one deliverable's attempts. */
export interface QueryContentChallengeAttemptsRequest {
    readonly challengeSubmissionId: string
    readonly filters: PaginationFilters<ContentChallengeAttemptSortBy>
}

/** GraphQL envelope containing one page of grading attempts. */
export interface QueryContentChallengeAttemptsResponse {
    readonly userChallengeSubmissionAttempts: GraphQLResponse<{
        readonly count: number
        readonly data: ReadonlyArray<ContentChallengeAttempt>
    }>
}

const query1 = gql`
    query ContentChallengeAttempts($request: UserChallengeSubmissionAttemptsRequest!) {
        userChallengeSubmissionAttempts(request: $request) {
            success
            message
            error
            data {
                count
                data {
                    id
                    attemptGroupId
                    attemptNumber
                    score
                    shortFeedback
                    processedAt
                    submissionUrl
                    servedModel
                    servedProvider
                    evaluationJobId
                    status
                    draftRevision
                    submittedAt
                    updatedAt
                    platformDecision
                    confidence
                    uncertainty
                    nextAction
                    finalizationRevision
                }
            }
        }
    }
`

/** Finite challenge-attempt document variants. */
export enum QueryContentChallengeAttempts { Query1 = "query1" }

/** Every supported challenge-attempt document keyed by its finite variant. */
export const queryContentChallengeAttemptsMap: Record<QueryContentChallengeAttempts, DocumentNode> = {
    [QueryContentChallengeAttempts.Query1]: query1,
}

/** Lists the viewer's newest grading attempts for one challenge deliverable. */
export const queryContentChallengeAttempts = async ({
    query = QueryContentChallengeAttempts.Query1,
    request,
    headers,
    signal,
    debug,
}: LookupQueryParams<QueryContentChallengeAttempts, QueryContentChallengeAttemptsRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryContentChallengeAttemptsResponse>({
        query: queryContentChallengeAttemptsMap[query],
        variables: { request },
        fetchPolicy: "network-only",
    })
}
