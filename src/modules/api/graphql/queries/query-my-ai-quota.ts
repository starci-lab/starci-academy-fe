import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type QueryParams } from "../types"
import { type QueryMyAiQuotaResponse } from "./types/my-ai-quota"

/**
 * The asking learner's AI allowance.
 *
 * Only the weekly credit pair is selected. The tier, the reset timestamps, the allowed model
 * categories and the per-request ceiling all sit one field away and are all deliberately left
 * out: this document exists to state a standing figure, and the surface that has to explain a
 * REFUSAL needs a different selection and should ask for it as a second variant.
 * Required-auth, so the client always carries the token.
 */
const query1 = gql`
    query MyAiQuota {
        myAiQuota {
            success
            message
            error
            data {
                credit {
                    limitWeek
                    remainingWeek
                }
            }
        }
    }
`

/** The document variants of this query. */
export enum QueryMyAiQuota {
    /** The weekly credit pair only. */
    Query1 = "query1",
}

/** Every document this query can send, keyed by variant. */
export const queryMyAiQuotaMap: Record<QueryMyAiQuota, DocumentNode> = {
    [QueryMyAiQuota.Query1]: query1,
}

/** Fetches the asking learner's AI quota. Always sends the bearer token. */
export const queryMyAiQuota = async ({
    query = QueryMyAiQuota.Query1,
    headers,
    signal,
    debug,
}: QueryParams<QueryMyAiQuota> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryMyAiQuotaResponse>({
        query: queryMyAiQuotaMap[query],
    })
}
