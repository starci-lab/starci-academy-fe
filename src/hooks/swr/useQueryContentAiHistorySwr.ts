import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryContentAiHistory } from "../../modules/api/graphql/queries/query-content-ai-history"
import type { ContentAiHistoryData } from "../../modules/api/graphql/queries/types/content-ai-history"

/** Viewer/session-scoped cache prefix for one persisted transcript. */
export const QUERY_CONTENT_AI_HISTORY_SWR_KEY = "QUERY_CONTENT_AI_HISTORY_SWR"

/** Loads one owned conversation only after both viewer and session identity exist. */
export const useQueryContentAiHistorySwr = (sessionId?: string | null) => {
    const viewer = useViewerKey()
    return useSWR<ContentAiHistoryData | null>(
        viewer === undefined || sessionId === undefined || sessionId === null
            ? null
            : [QUERY_CONTENT_AI_HISTORY_SWR_KEY, viewer, sessionId],
        async ([, , keyedSessionId]: [string, string, string]) => {
            const result = await queryContentAiHistory({ request: { sessionId: keyedSessionId } })
            return result.data?.contentAiSessionMessages?.data ?? null
        },
    )
}
