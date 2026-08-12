import useSWRInfinite from "swr/infinite"
import { useViewerKey } from "../auth/useViewerKey"
import { queryMyFeed } from "../../modules/api/graphql/queries/query-my-feed"
import {
    MyFeedCategory,
    MyFeedTab,
    type QueryMyFeedResponseData,
} from "../../modules/api/graphql/queries/types/my-feed"

/** Number of activities requested for each cursor page. */
export const MY_FEED_PAGE_LIMIT = 5

/** Stable cache-key prefix for cursor-paginated dashboard activity. */
export const QUERY_MY_FEED_SWR_KEY = "QUERY_MY_FEED_SWR"

type MyFeedSwrKey = readonly [
    typeof QUERY_MY_FEED_SWR_KEY,
    string,
    MyFeedTab,
    MyFeedCategory,
    string,
]

/** Reads cursor pages of dashboard activity for the authenticated viewer. */
export const useQueryMyFeedSwr = (
    tab: MyFeedTab,
    category: MyFeedCategory = MyFeedCategory.All,
) => {
    const viewer = useViewerKey()

    return useSWRInfinite<QueryMyFeedResponseData>(
        (pageIndex, previousPageData) => {
            if (viewer === undefined || previousPageData?.nextCursor === null) return null
            const cursor = pageIndex === 0 ? "" : previousPageData?.nextCursor ?? ""
            return [QUERY_MY_FEED_SWR_KEY, viewer, tab, category, cursor] as MyFeedSwrKey
        },
        async ([, , currentTab, currentCategory, cursor]: MyFeedSwrKey) => {
            const result = await queryMyFeed({
                request: {
                    tab: currentTab,
                    category: currentCategory,
                    cursor: cursor === "" ? undefined : cursor,
                    limit: MY_FEED_PAGE_LIMIT,
                },
            })
            return result.data?.myFeed?.data ?? { items: [], nextCursor: null }
        },
    )
}
