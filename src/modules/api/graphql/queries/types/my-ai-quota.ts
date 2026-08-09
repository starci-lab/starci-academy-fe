import { type GraphQLResponse } from "../../types"

/**
 * The credit half of the AI quota.
 *
 * The back end tracks two windows - a rolling five-hour one and a weekly one - each with a
 * limit, a used figure and a remaining figure. Only the WEEKLY pair is selected: it is the
 * one the standing row states, and the five-hour window belongs to the surface that asks a
 * model to answer, where the reader is about to be told why a request was refused.
 */
export interface MyAiCreditData {
    /** Credit allowed per week. */
    limitWeek: number
    /**
     * Credit left this week. Sent by the server rather than derived from `limitWeek` minus a
     * used figure, because the server owns when the window resets and the client does not.
     */
    remainingWeek: number
}

/**
 * The AI quota the dashboard reads.
 *
 * `MyAiQuotaResponseData` also carries the subscription tier, the two window reset times,
 * the allowed model categories and the per-request ceiling. None is rendered here.
 */
export interface MyAiQuotaData {
    /** Weekly credit allowance and what is left of it. */
    credit: MyAiCreditData
}

/** The response shape of the `myAiQuota` query, envelope included. */
export interface QueryMyAiQuotaResponse {
    /** The top-level field, wrapping the standard envelope. */
    myAiQuota: GraphQLResponse<MyAiQuotaData>
}
