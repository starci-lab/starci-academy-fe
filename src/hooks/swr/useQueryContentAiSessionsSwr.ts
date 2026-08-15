import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryContentAiSessions } from "../../modules/api/graphql/queries/query-content-ai-sessions"
import type {
    ContentAiSessionsData,
    QueryContentAiSessionsRequest,
} from "../../modules/api/graphql/queries/types/content-ai-sessions"

/** Viewer-scoped cache prefix for conversation lists and searches. */
export const QUERY_CONTENT_AI_SESSIONS_SWR_KEY = "QUERY_CONTENT_AI_SESSIONS_SWR"

/** Lists the current viewer's conversations; `null` pauses until route grounding is resolvable. */
export const useQueryContentAiSessionsSwr = (request: QueryContentAiSessionsRequest | null = {}) => {
    const viewer = useViewerKey()
    return useSWR<ContentAiSessionsData | null>(
        viewer === undefined || request === null ? null : [QUERY_CONTENT_AI_SESSIONS_SWR_KEY, viewer, request],
        async ([, , keyedRequest]: [string, string, QueryContentAiSessionsRequest]) => {
            const result = await queryContentAiSessions({ request: keyedRequest })
            return result.data?.contentAiSessions?.data ?? null
        },
    )
}
