import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type QueryParams } from "../types"
import { type QueryMyInProgressChallengesResponse } from "./types/my-resume"

/**
 * The challenges the asking learner has started and not yet passed.
 *
 * THE SAME TWO FIELDS AS THE LESSON QUERY, and deliberately not merged with it. They are separate
 * fields on the schema answering separate questions, and keeping them separate here is what lets
 * the kind of a resume target be known from which request returned it - the payload itself does
 * not say. Required-auth, so the client always carries the token.
 */
const query1 = gql`
    query MyInProgressChallenges {
        myInProgressChallenges {
            success
            message
            error
            data {
                globalId
                label
            }
        }
    }
`

/** The document variants of this query. */
export enum QueryMyInProgressChallenges {
    /** The outstanding challenges themselves. */
    Query1 = "query1",
}

/** Every document this query can send, keyed by variant. */
export const queryMyInProgressChallengesMap: Record<QueryMyInProgressChallenges, DocumentNode> = {
    [QueryMyInProgressChallenges.Query1]: query1,
}

/** Fetches the challenges the asking learner has started. Always sends the bearer token. */
export const queryMyInProgressChallenges = async ({
    query = QueryMyInProgressChallenges.Query1,
    headers,
    signal,
    debug,
}: QueryParams<QueryMyInProgressChallenges> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryMyInProgressChallengesResponse>({
        query: queryMyInProgressChallengesMap[query],
    })
}
