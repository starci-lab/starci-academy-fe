import useSWR from "swr"
import { queryChangelogEntries } from "../../modules/api/graphql/queries/query-changelog-entries"
import { type ChangelogEntry } from "../../modules/api/graphql/queries/types/changelog-entries"

/** Stable global cache key for the newest published changelog entries. */
export const QUERY_CHANGELOG_ENTRIES_SWR_KEY = ["QUERY_CHANGELOG_ENTRIES_SWR"]

/** Reads the four newest published changelog entries. */
export const useQueryChangelogEntriesSwr = () => useSWR<Array<ChangelogEntry>>(
    QUERY_CHANGELOG_ENTRIES_SWR_KEY,
    async () => {
        const result = await queryChangelogEntries()
        return result.data?.changelogEntries?.data ?? []
    },
)
