import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { querySuggestedUsers } from "../../modules/api/graphql/queries/query-suggested-users"
import type { QuerySuggestedUserData } from "../../modules/api/graphql/queries/types/suggested-users"

/** Stable cache-key prefix for viewer-scoped follow suggestions. */
export const QUERY_SUGGESTED_USERS_SWR_KEY = ["QUERY_SUGGESTED_USERS_SWR"]

/** Reads follow suggestions for an authenticated viewer. */
export const useQuerySuggestedUsersSwr = () => {
    const viewer = useViewerKey()
    return useSWR<Array<QuerySuggestedUserData> | null>(
        viewer === undefined ? null : [...QUERY_SUGGESTED_USERS_SWR_KEY, viewer],
        async () => {
            const result = await querySuggestedUsers()
            return result.data?.suggestedUsers?.data ?? null
        },
    )
}

