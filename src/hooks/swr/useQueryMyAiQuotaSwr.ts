import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryMyAiQuota } from "../../modules/api/graphql/queries/query-my-ai-quota"
import { type MyAiQuotaData } from "../../modules/api/graphql/queries/types/my-ai-quota"

/**
 * The cache key for the asking learner's AI quota.
 *
 * Exported so that whatever SPENDS credit can revalidate the figure it just changed. A quota
 * row that keeps showing the pre-request number is the most confusing kind of stale: the
 * reader has visible evidence the request happened.
 */
export const QUERY_MY_AI_QUOTA_SWR_KEY = ["QUERY_MY_AI_QUOTA_SWR"]

/**
 * Reads the asking learner's weekly AI credit allowance.
 *
 * The envelope is unwrapped here, once, so no component reaches through
 * `data.myAiQuota.data`. A missing payload becomes `null` rather than `undefined`, which
 * keeps "you have no quota record" distinguishable from "the quota is still loading" - and
 * a quota row must never render a zero it invented for either case.
 */
export const useQueryMyAiQuotaSwr = () => {
    const viewer = useViewerKey()
    return useSWR<MyAiQuotaData | null>(
        viewer === undefined ? null : [...QUERY_MY_AI_QUOTA_SWR_KEY, viewer],
        async () => {
            const result = await queryMyAiQuota()
            return result.data?.myAiQuota?.data ?? null
        },
    )
}
