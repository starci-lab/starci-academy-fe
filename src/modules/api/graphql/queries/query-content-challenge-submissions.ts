import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse, LookupQueryParams } from "../types"

/** Authored deliverable enriched with the viewer's recoverable draft and latest immutable attempt. */
export interface ContentChallengeDraftSubmission {
    readonly id: string
    readonly title: string
    readonly description: string | null
    readonly score: number
    readonly sortIndex: number
    readonly userSubmission?: {
        readonly id: string
        readonly submissionUrl: string
        readonly draftRevision: number
        readonly draftUpdatedAt: string | null
        readonly lastAttempt?: {
            readonly id: string
            readonly attemptGroupId: string | null
            readonly evaluationJobId: string | null
            readonly status: string
            readonly platformDecision: string | null
            readonly processedAt: string | null
            readonly score: number | null
            readonly shortFeedback: string | null
            readonly confidence: number | null
            readonly uncertainty: string | null
            readonly nextAction: string | null
        } | null
    } | null
}

/** Challenge-scoped lookup used to render the complete deliverable collection. */
export interface QueryContentChallengeSubmissionsRequest {
    readonly challengeId: string
    readonly filters: { readonly sorts: ReadonlyArray<{ readonly by: "createdAt" | "updatedAt" | "name"; readonly order: "ASC" | "DESC" }> }
}

/** GraphQL envelope for the complete authored Challenge submission collection. */
export interface QueryContentChallengeSubmissionsResponse {
    readonly challengeSubmissions: GraphQLResponse<{ readonly data: ReadonlyArray<ContentChallengeDraftSubmission> }>
}

const query1 = gql`
    query ContentChallengeSubmissions($request: ChallengeSubmissionsRequest!) {
        challengeSubmissions(request: $request) {
            success
            message
            error
            data {
                data {
                    id title description score sortIndex
                    userSubmission {
                        id submissionUrl draftRevision draftUpdatedAt
                        lastAttempt {
                            id attemptGroupId evaluationJobId status platformDecision processedAt
                            score shortFeedback confidence uncertainty nextAction
                        }
                    }
                }
            }
        }
    }
`

export enum QueryContentChallengeSubmissions { Query1 = "query1" }

/** Finite GraphQL document map for Challenge deliverable lookups. */
export const queryContentChallengeSubmissionsMap: Record<QueryContentChallengeSubmissions, DocumentNode> = {
    [QueryContentChallengeSubmissions.Query1]: query1,
}

/** Loads all deliverables and the viewer-owned draft/result state for one Challenge. */
export const queryContentChallengeSubmissions = async ({
    query = QueryContentChallengeSubmissions.Query1,
    request,
    headers,
    signal,
    debug,
}: LookupQueryParams<QueryContentChallengeSubmissions, QueryContentChallengeSubmissionsRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryContentChallengeSubmissionsResponse>({
        query: queryContentChallengeSubmissionsMap[query],
        variables: { request },
        fetchPolicy: "network-only",
    })
}
