import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { MutationParams } from "./types/params"
import type { MutationReactActivityResponse, ReactActivityRequest } from "./types/react-activity"

const mutation1 = gql`
    mutation ReactToActivity($request: ReactToActivityRequest!) {
        reactToActivity(request: $request) {
            success
            message
            error
            data { total myReaction }
        }
    }
`

export enum MutationReactActivity { Mutation1 = "mutation1" }

/** Every supported activity-reaction document keyed by its public variant. */
export const mutationReactActivityMap: Record<MutationReactActivity, DocumentNode> = {
    [MutationReactActivity.Mutation1]: mutation1,
}

/** Sets, changes, or removes the viewer's reaction on one feed activity. */
export const mutationReactActivity = async ({
    mutation = MutationReactActivity.Mutation1,
    request,
    headers,
    signal,
    debug,
}: MutationParams<MutationReactActivity, ReactActivityRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.mutate<MutationReactActivityResponse>({
        mutation: mutationReactActivityMap[mutation],
        variables: { request },
    })
}

