import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryMyProSubscription } from "../../modules/api/graphql/queries/query-pro-subscription"
import { type MyProSubscriptionData } from "../../modules/api/graphql/queries/types/pro-subscription"

/** Stable cache prefix for the viewer-owned Pro lifecycle. */
export const QUERY_MY_PRO_SUBSCRIPTION_SWR_KEY = "QUERY_MY_PRO_SUBSCRIPTION_SWR"

/** Optional polling cadence while backend settlement is being verified. */
export type UseQueryMyProSubscriptionSwrOptions = {
    readonly refreshInterval?: number
}

/** Resolve active access and optionally poll while a returned payment is being verified. */
export const useQueryMyProSubscriptionSwr = ({ refreshInterval = 0 }: UseQueryMyProSubscriptionSwrOptions = {}) => {
    const viewer = useViewerKey()
    return useSWR<MyProSubscriptionData | null>(
        viewer === undefined ? null : [QUERY_MY_PRO_SUBSCRIPTION_SWR_KEY, viewer],
        async () => {
            const result = await queryMyProSubscription()
            return result.data?.myProSubscription?.data ?? null
        },
        { refreshInterval },
    )
}
