import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryMyJobReadiness } from "../../modules/api/graphql/queries/query-my-job-readiness"
import { type MyJobReadinessData } from "../../modules/api/graphql/queries/types/job-readiness"

/** Stable cache-key prefix for the viewer's job-readiness snapshot. */
export const QUERY_MY_JOB_READINESS_SWR_KEY = ["QUERY_MY_JOB_READINESS_SWR"]

/** Reads the authenticated learner's foundation and per-course readiness tracks. */
export const useQueryMyJobReadinessSwr = () => {
    const viewer = useViewerKey()
    return useSWR<MyJobReadinessData | null>(
        viewer === undefined ? null : [...QUERY_MY_JOB_READINESS_SWR_KEY, viewer],
        async () => {
            const result = await queryMyJobReadiness()
            return result.data?.myJobReadiness?.data ?? null
        },
    )
}
