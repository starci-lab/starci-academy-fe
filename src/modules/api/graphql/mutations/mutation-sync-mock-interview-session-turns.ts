import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse } from "../types"
import type { MockInterviewMutationOptions } from "./mutation-start-mock-interview-session"
import type { MockInterviewTurn } from "../queries/query-my-in-progress-mock-interview-session"

/** Transcript and cursors persisted for a resumable session. */
export type SyncMockInterviewSessionTurnsRequest = {
    readonly sessionId: string
    readonly expectedRevision?: number
    readonly turns: ReadonlyArray<MockInterviewTurn>
    readonly questionIndex: number
    readonly phaseIndex: number
}

/** GraphQL envelope returned by transcript persistence. */
export type MutationSyncMockInterviewSessionTurnsResponse = {
    readonly syncMockInterviewSessionTurns: GraphQLResponse<{
        readonly success: boolean
        readonly conflict: boolean
        readonly revision: number
        readonly turns: ReadonlyArray<MockInterviewTurn>
        readonly questionIndex: number
        readonly phaseIndex: number
    }>
}

/** GraphQL document for best-effort transcript persistence. */
export const syncMockInterviewSessionTurnsDocument: DocumentNode = gql`
    mutation SyncMockInterviewSessionTurns($request: SyncMockInterviewSessionTurnsRequest!) {
        syncMockInterviewSessionTurns(request: $request) {
            success message error
            data {
                success conflict revision questionIndex phaseIndex
                turns { role phase content questionIndex artifactHint }
            }
        }
    }
`

/** Execute a transcript persistence write for one session. */
export const mutationSyncMockInterviewSessionTurns = async (
    request: SyncMockInterviewSessionTurnsRequest,
    options: MockInterviewMutationOptions = {},
) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.mutate<MutationSyncMockInterviewSessionTurnsResponse>({
        mutation: syncMockInterviewSessionTurnsDocument,
        variables: { request },
    })
}
