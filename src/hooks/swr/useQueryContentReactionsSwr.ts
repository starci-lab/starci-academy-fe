import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import { queryContentReactions, type ContentReactionSummary } from "@/modules/api/graphql/queries/query-content-reactions"

/** Stable SWR cache prefix for viewer-scoped lesson reaction summaries. */
export const QUERY_CONTENT_REACTIONS_SWR_KEY = "QUERY_CONTENT_REACTIONS_SWR"

/** Reads one viewer-scoped reaction summary; no content or viewer means no request. */
export const useQueryContentReactionsSwr = (contentId?: string) => {
    const viewer = useViewerKey()
    return useSWR<ContentReactionSummary | null>(
        contentId === undefined || viewer === undefined
            ? null
            : [QUERY_CONTENT_REACTIONS_SWR_KEY, contentId, viewer],
        async () => {
            if (contentId === undefined) throw new Error("Content id not found")
            const result = await queryContentReactions({ request: { contentId } })
            return result.data?.contentReactions?.data ?? null
        },
    )
}
