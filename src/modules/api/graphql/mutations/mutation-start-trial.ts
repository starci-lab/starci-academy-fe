import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type GraphQLHeaders } from "../types"
import {
    type MutationStartTrialRequest,
    type MutationStartTrialResponse,
} from "./types/start-trial"

const mutation = gql`
    mutation StartTrial($request: StartTrialRequest!) {
        startTrial(request: $request) {
            success
            message
            error
            data { isEnrolled }
        }
    }
`

/** Transport options accepted by the start-trial mutation. */
export type StartTrialOptions = {
    readonly headers?: GraphQLHeaders
    readonly signal?: AbortSignal
    readonly debug?: boolean
}

/** Record a preview enrollment for one course. */
export const mutationStartTrial = async (
    request: MutationStartTrialRequest,
    options: StartTrialOptions = {},
) => {
    const apollo = createApolloClient({ withAuth: true, ...options })
    return apollo.mutate<MutationStartTrialResponse>({ mutation, variables: { request } })
}
