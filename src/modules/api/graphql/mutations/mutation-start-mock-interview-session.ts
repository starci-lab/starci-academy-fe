import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLHeaders, GraphQLResponse } from "../types"
import type { MockInterviewSeedQuestion } from "../queries/query-my-in-progress-mock-interview-session"

/** Configuration accepted by the backend session draw. */
export type StartMockInterviewSessionRequest = {
    readonly courseId: string
    readonly level: string
    readonly mode: string
    readonly lang?: string
    readonly langs?: ReadonlyArray<string>
    readonly questionCount?: number
    readonly kinds?: ReadonlyArray<string>
    readonly countsToReadiness?: boolean
    readonly name?: string
}

/** Durable session identity and question seed returned by a successful draw. */
export type StartMockInterviewSessionData = {
    readonly sessionId: string
    readonly promptId: string
    readonly promptTitle: string
    readonly difficulty: string
    readonly source: string
    readonly level: string
    readonly mode: string
    readonly seedTopics: ReadonlyArray<MockInterviewSeedQuestion>
    readonly deadlineAt: string
    readonly revision: number
    readonly status: string
}

/** GraphQL envelope returned by session creation. */
export type MutationStartMockInterviewSessionResponse = {
    readonly startMockInterviewSession: GraphQLResponse<StartMockInterviewSessionData>
}

/** GraphQL document for drawing a durable interview session. */
export const startMockInterviewSessionDocument: DocumentNode = gql`
    mutation StartMockInterviewSession($request: StartMockInterviewSessionRequest!) {
        startMockInterviewSession(request: $request) {
            success message error
            data {
                sessionId promptId promptTitle difficulty source level mode deadlineAt revision status
                seedTopics { cardId kind title givenCodes { lang code } }
            }
        }
    }
`

/** Shared transport options for authenticated interview mutations. */
export type MockInterviewMutationOptions = {
    readonly headers?: GraphQLHeaders
    readonly signal?: AbortSignal
    readonly debug?: boolean
}

/** Execute the enrolled viewer's session draw. */
export const mutationStartMockInterviewSession = async (
    request: StartMockInterviewSessionRequest,
    options: MockInterviewMutationOptions = {},
) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.mutate<MutationStartMockInterviewSessionResponse>({
        mutation: startMockInterviewSessionDocument,
        variables: { request },
    })
}
