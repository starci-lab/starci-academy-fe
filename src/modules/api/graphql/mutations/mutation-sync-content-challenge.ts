import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { MutationParams } from "./types/params"
import type { GraphQLResponse } from "../types"

/** One optimistic-concurrency draft write for an authored deliverable. */
export interface SyncContentChallengeRequest {
    readonly id: string
    readonly url?: string
    readonly expectedDraftRevision?: number
}

/** Durable revision returned by the backend draft authority. */
export interface SyncContentChallengeResult {
    readonly draftRevision: number
    readonly savedAt: string | null
}

/** GraphQL envelope for a recoverable Challenge draft write. */
export interface MutationSyncContentChallengeResponse {
    readonly syncSubmission: GraphQLResponse<SyncContentChallengeResult>
}

const mutation1 = gql`
    mutation SyncChallengeSubmission($request: SyncSubmissionRequest!) {
        syncSubmission(request: $request) {
            success
            message
            error
            data { draftRevision savedAt }
        }
    }
`

export enum MutationSyncContentChallenge { Mutation1 = "mutation1" }

/** Registry of supported draft-sync operation documents. */
export const mutationSyncContentChallengeMap: Record<MutationSyncContentChallenge, DocumentNode> = {
    [MutationSyncContentChallenge.Mutation1]: mutation1,
}

/** Saves one recoverable deliverable draft without enqueueing evaluation. */
export const mutationSyncContentChallenge = async ({
    mutation = MutationSyncContentChallenge.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationSyncContentChallenge, SyncContentChallengeRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.mutate<MutationSyncContentChallengeResponse>({
        mutation: mutationSyncContentChallengeMap[mutation],
        variables: { request },
    })
}
