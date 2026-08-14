import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLHeaders, GraphQLResponse } from "../types"
import type { PlaygroundStep } from "../queries/query-playground"

/** Server-supported scaffolding modes for one playground run. */
export type PlaygroundSessionMode = "guided" | "free"

/** Backend request used to create one enrolled learner's playground session. */
export type StartPlaygroundSessionRequest = {
    readonly playgroundId: string
    readonly mode?: PlaygroundSessionMode
}

/** Session snapshot returned with its pairing code and ordered steps. */
export type PlaygroundSession = {
    readonly id: string
    readonly pairingCode: string
    readonly mode: PlaygroundSessionMode
    readonly steps: ReadonlyArray<PlaygroundStep>
}

type StartPlaygroundSessionResponse = {
    readonly createPlaygroundSession: GraphQLResponse<PlaygroundSession>
}

/** Transport options for the authenticated playground-session mutation. */
export type StartPlaygroundSessionParams = {
    readonly request: StartPlaygroundSessionRequest
    readonly headers?: GraphQLHeaders
    readonly signal?: AbortSignal
    readonly debug?: boolean
}

const document = gql`
    mutation StartPlaygroundSession($request: CreatePlaygroundSessionRequest!) {
        createPlaygroundSession(request: $request) {
            success
            message
            error
            data {
                id
                pairingCode
                mode
                steps { id sortIndex title body commandHint actionHint }
            }
        }
    }
`

/** Start the authenticated, enrollment-gated playground session used by setup and live routes. */
export const mutationStartPlaygroundSession = async ({ request, headers, signal, debug }: StartPlaygroundSessionParams) =>
    createApolloClient({ withAuth: true, headers, signal, debug }).mutate<StartPlaygroundSessionResponse>({
        mutation: document,
        variables: { request },
    })
