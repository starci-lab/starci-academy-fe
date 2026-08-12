import { type GraphQLResponse } from "../../types"

/** One published product changelog entry. */
export type ChangelogEntry = {
    readonly id: string
    readonly title: string
    readonly body: string
    readonly category: string
    readonly publishedAt: string
    readonly linkUrl: string | null
}

/** Standard GraphQL envelope returned by the changelog query. */
export type QueryChangelogEntriesResponse = {
    readonly changelogEntries: GraphQLResponse<Array<ChangelogEntry>>
}
