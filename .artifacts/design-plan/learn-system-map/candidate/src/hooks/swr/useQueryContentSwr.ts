import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import { queryContent } from "~candidate/modules/api/graphql/queries/query-content"
import { type ContentDetail } from "~candidate/modules/api/graphql/queries/types/content"

/** The key prefix, so anything that changes a content can revalidate every read of one. */
export const QUERY_CONTENT_SWR_KEY = "QUERY_CONTENT_SWR"

/** What a caller must say about the content it wants. */
export interface UseQueryContentSwrParams {
    /** The content's primary id - the segment the reader's route carries. */
    id?: string
}

/**
 * Reads one content.
 *
 * THE VIEWER IS PART OF THE KEY, and here that is not caution but correctness: the server truncates
 * a premium body for a reader who is not entitled, so the SAME content id has two legitimate
 * answers. Keyed by id alone, a trial reader's truncated body would be served to the enrolled
 * reader who signed in after them - a paid lesson replaced by its teaser, from cache, with no
 * request to blame.
 *
 * IT DOES NOT FETCH WITHOUT BOTH. `null` as the key is SWR's own way of saying "not yet": no id
 * means the route has not resolved, and no viewer means the token has not arrived. Asking anyway
 * would cache a failure under the key the real request needs.
 *
 * THE ENVELOPE IS UNWRAPPED ONCE, here, so nothing downstream reaches through
 * `data.content.data`. An absent payload becomes `null` rather than an empty object, because a
 * content that is not there is a state the reader has to be told about, not a content with no title.
 */
export const useQueryContentSwr = ({ id }: UseQueryContentSwrParams = {}) => {
    const viewer = useViewerKey()
    return useSWR<ContentDetail | null>(
        id === undefined || viewer === undefined ? null : [QUERY_CONTENT_SWR_KEY, id, viewer],
        async () => {
            const result = await queryContent({ request: { id } })
            return result.data?.content?.data ?? null
        },
    )
}
