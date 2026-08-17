import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { MutationParams } from "./types/params"
import type { MutationSetFollowResponse, SetFollowRequest } from "./types/set-follow"

const mutation1 = gql`
    mutation SetFollow($request: SetFollowRequest!) {
        setFollow(request: $request) { success message error }
    }
`

/** Selects learner follow-state changes in the shared GraphQL executor. */
export enum MutationSetFollow { Mutation1 = "mutation1" }

/** Every supported follow document keyed by its public variant. */
export const mutationSetFollowMap: Record<MutationSetFollow, DocumentNode> = {
    [MutationSetFollow.Mutation1]: mutation1,
}

/** Sets the authenticated viewer's follow state for one user. */
export const mutationSetFollow = async ({
    mutation = MutationSetFollow.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationSetFollow, SetFollowRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.mutate<MutationSetFollowResponse>({
        mutation: mutationSetFollowMap[mutation],
        variables: { request },
    })
}

