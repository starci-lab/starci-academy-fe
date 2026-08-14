import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse, LookupQueryParams, PaginationFilters } from "../types"

/** One scorer-authored finding attached to a grading attempt. */
export interface ContentChallengeFeedback {
    readonly id: string
    readonly message: string
    readonly detail: string | null
    readonly severity: "low" | "medium" | "high"
    readonly location: string | null
    readonly suggestion: string | null
    readonly sortIndex: number
}

/** Sort keys accepted by the challenge-feedback list. */
export type ContentChallengeFeedbackSortBy = "sortIndex" | "severity" | "createdAt" | "updatedAt"

/** Scope and page window for one attempt's feedback. */
export interface QueryContentChallengeFeedbacksRequest {
    readonly submissionAttemptId: string
    readonly filters: PaginationFilters<ContentChallengeFeedbackSortBy>
}

/** GraphQL envelope containing one page of grading feedback. */
export interface QueryContentChallengeFeedbacksResponse {
    readonly userChallengeSubmissionFeedbacks: GraphQLResponse<{
        readonly count: number
        readonly data: ReadonlyArray<ContentChallengeFeedback>
    }>
}

const query1 = gql`
    query ContentChallengeFeedbacks($request: UserChallengeSubmissionFeedbacksRequest!) {
        userChallengeSubmissionFeedbacks(request: $request) {
            success
            message
            error
            data {
                count
                data { id message detail severity location suggestion sortIndex }
            }
        }
    }
`

/** Finite challenge-feedback document variants. */
export enum QueryContentChallengeFeedbacks { Query1 = "query1" }

/** Every supported challenge-feedback document keyed by its finite variant. */
export const queryContentChallengeFeedbacksMap: Record<QueryContentChallengeFeedbacks, DocumentNode> = {
    [QueryContentChallengeFeedbacks.Query1]: query1,
}

/** Lists scorer feedback in authored order for one grading attempt. */
export const queryContentChallengeFeedbacks = async ({
    query = QueryContentChallengeFeedbacks.Query1,
    request,
    headers,
    signal,
    debug,
}: LookupQueryParams<QueryContentChallengeFeedbacks, QueryContentChallengeFeedbacksRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryContentChallengeFeedbacksResponse>({
        query: queryContentChallengeFeedbacksMap[query],
        variables: { request },
    })
}
