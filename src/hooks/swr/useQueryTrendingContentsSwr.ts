import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryTrendingContents } from "../../modules/api/graphql/queries/query-trending-contents"
import type { QueryTrendingContentItemData } from "../../modules/api/graphql/queries/types/trending-contents"

/** Stable cache-key prefix for viewer-scoped trending content. */
export const QUERY_TRENDING_CONTENTS_SWR_KEY = ["QUERY_TRENDING_CONTENTS_SWR"]

/** Reads content currently trending for an authenticated viewer. */
export const useQueryTrendingContentsSwr = () => {
    const viewer = useViewerKey()
    return useSWR<Array<QueryTrendingContentItemData>>(
        viewer === undefined ? null : [...QUERY_TRENDING_CONTENTS_SWR_KEY, viewer],
        async () => {
            const result = await queryTrendingContents()
            return result.data?.trendingContents?.data ?? []
        },
    )
}

