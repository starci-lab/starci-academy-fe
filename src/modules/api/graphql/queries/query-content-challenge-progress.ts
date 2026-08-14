import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse, LookupQueryParams } from "../types"

/** One course challenge's persisted viewer progress. */
export interface ContentChallengeProgress {
    readonly id: string
    readonly lastScore: number
    readonly maxScore: number
    readonly completed: boolean
    readonly status: "notStarted" | "inProgress" | "failed" | "completed"
    readonly numAttempts: number
}

/** Course identity accepted by the challenge-progress query. */
export interface QueryContentChallengeProgressRequest {
    readonly courseId: string
}

/** GraphQL envelope containing every challenge progress row in one course. */
export interface QueryContentChallengeProgressResponse {
    readonly challengeSubmissionProgress: GraphQLResponse<{
        readonly completionTasks: ReadonlyArray<ContentChallengeProgress>
    }>
}

const query1 = gql`
    query ContentChallengeProgress($request: ChallengeSubmissionProgressRequest!) {
        challengeSubmissionProgress(request: $request) {
            success
            message
            error
            data {
                completionTasks { id lastScore maxScore completed status numAttempts }
            }
        }
    }
`

/** Finite challenge-progress document variants. */
export enum QueryContentChallengeProgress { Query1 = "query1" }

/** Every supported challenge-progress document keyed by its finite variant. */
export const queryContentChallengeProgressMap: Record<QueryContentChallengeProgress, DocumentNode> = {
    [QueryContentChallengeProgress.Query1]: query1,
}

/** Reads persisted viewer progress for all challenges in one course. */
export const queryContentChallengeProgress = async ({
    query = QueryContentChallengeProgress.Query1,
    request,
    headers,
    signal,
    debug,
}: LookupQueryParams<QueryContentChallengeProgress, QueryContentChallengeProgressRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryContentChallengeProgressResponse>({
        query: queryContentChallengeProgressMap[query],
        variables: { request },
    })
}
