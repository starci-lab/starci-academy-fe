import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import { type QueryParams } from "../types"
import { type QueryMyRewardWalletResponse } from "./types/my-reward-wallet"

/**
 * The asking learner's reward-point balance.
 *
 * One scalar, on purpose. `redemptions` sits beside it and is a whole history: selecting it
 * here would make every dashboard load pay for a table that only the wallet surface draws.
 * Required-auth, so the client always carries the token.
 */
const query1 = gql`
    query MyRewardWallet {
        myRewardWallet {
            success
            message
            error
            data {
                balance
            }
        }
    }
`

/** The document variants of this query. */
export enum QueryMyRewardWallet {
    /** The balance only. */
    Query1 = "query1",
}

/** Every document this query can send, keyed by variant. */
export const queryMyRewardWalletMap: Record<QueryMyRewardWallet, DocumentNode> = {
    [QueryMyRewardWallet.Query1]: query1,
}

/** Fetches the asking learner's reward wallet. Always sends the bearer token. */
export const queryMyRewardWallet = async ({
    query = QueryMyRewardWallet.Query1,
    headers,
    signal,
    debug,
}: QueryParams<QueryMyRewardWallet> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryMyRewardWalletResponse>({
        query: queryMyRewardWalletMap[query],
    })
}
