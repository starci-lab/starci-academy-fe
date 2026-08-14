import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import { queryContentComments, type ContentCommentsPage } from "@/modules/api/graphql/queries/query-content-comments"

/** Stable SWR cache prefix for viewer-scoped lesson discussion pages. */
export const QUERY_CONTENT_COMMENTS_SWR_KEY = "QUERY_CONTENT_COMMENTS_SWR"

/** Paging and scope identity for one lesson discussion read. */
export interface UseQueryContentCommentsSwrParams {
    readonly contentId?: string
    readonly parentCommentId?: string | null
    readonly page?: number
    readonly limit?: number
}

/** Reads a viewer-scoped page of lesson discussion with every paging identity in the key. */
export const useQueryContentCommentsSwr = ({
    contentId,
    parentCommentId = null,
    page = 1,
    limit = 20,
}: UseQueryContentCommentsSwrParams = {}) => {
    const viewer = useViewerKey()
    return useSWR<ContentCommentsPage | null>(
        contentId === undefined || viewer === undefined
            ? null
            : [QUERY_CONTENT_COMMENTS_SWR_KEY, contentId, parentCommentId, page, limit, viewer],
        async () => {
            if (contentId === undefined) throw new Error("Content id not found")
            const result = await queryContentComments({
                request: { contentId, parentCommentId, page, limit },
            })
            return result.data?.contentComments?.data ?? null
        },
    )
}
