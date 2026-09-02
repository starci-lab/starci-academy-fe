import useSWR from "swr"
import { queryProOffer } from "../../modules/api/graphql/queries/query-pro-subscription"
import { type ProOfferData } from "../../modules/api/graphql/queries/types/pro-subscription"

/** Stable cache identity for the one public Pro offer. */
export const QUERY_PRO_OFFER_SWR_KEY = "QUERY_PRO_OFFER_SWR"

/** Read the only saleable learner offer from the backend-mounted catalogue. */
export const useQueryProOfferSwr = () => useSWR<ProOfferData | null>(QUERY_PRO_OFFER_SWR_KEY, async () => {
    const result = await queryProOffer()
    return result.data?.proOffer?.data ?? null
})
