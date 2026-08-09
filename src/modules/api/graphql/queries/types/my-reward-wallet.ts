import { type GraphQLResponse } from "../../types"

/**
 * The reward wallet the dashboard reads.
 *
 * The back end's `MyRewardWalletData` also carries `spent` and the full `redemptions`
 * history. The history is a list of rows that no dashboard surface draws, and selecting it
 * would make a one-number row pay for a table nobody reads.
 */
export interface MyRewardWalletData {
    /** Spendable reward-point balance. */
    balance: number
}

/** The response shape of the `myRewardWallet` query, envelope included. */
export interface QueryMyRewardWalletResponse {
    /** The top-level field, wrapping the standard envelope. */
    myRewardWallet: GraphQLResponse<MyRewardWalletData>
}
