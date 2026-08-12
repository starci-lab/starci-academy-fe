import type { GraphQLResponse } from "../../types"

/** One content item ranked by reads over the current trend window. */
export interface QueryTrendingContentItemData {
    readonly globalId: string
    readonly title: string
    readonly readCount: number
}

/** Standard response envelope returned by `trendingContents`. */
export interface QueryTrendingContentsResponse {
    readonly trendingContents: GraphQLResponse<Array<QueryTrendingContentItemData>>
}

