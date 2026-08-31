import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import { queryJobStatus, type AsyncJobStatusItem } from "@/modules/api/graphql/queries/query-job-status"

/** Cache family for one viewer-owned durable async job. */
export const QUERY_JOB_STATUS_SWR_KEY = "QUERY_JOB_STATUS_SWR"

/** Polls only while the named job can still change state. */
export const useQueryJobStatusSwr = (jobId?: string) => {
    const viewer = useViewerKey()
    return useSWR<AsyncJobStatusItem | null>(
        viewer === undefined || jobId === undefined
            ? null
            : [QUERY_JOB_STATUS_SWR_KEY, viewer, jobId],
        async () => queryJobStatus(jobId ?? ""),
        {
            refreshInterval: (job) => job?.status === "queued" || job?.status === "processing" ? 2000 : 0,
        },
    )
}
