import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryMyContributionCalendar } from "../../modules/api/graphql/queries/query-my-contribution-calendar"
import { type MyContributionDay } from "../../modules/api/graphql/queries/types/my-contribution-calendar"

/** Stable cache-key prefix for the viewer's year-specific contribution calendar. */
export const QUERY_MY_CONTRIBUTION_CALENDAR_SWR_KEY = ["QUERY_MY_CONTRIBUTION_CALENDAR_SWR"]

/** Reads the authenticated learner's active contribution days for one calendar year. */
export const useQueryMyContributionCalendarSwr = (year?: number) => {
    const viewer = useViewerKey()
    return useSWR<Array<MyContributionDay>>(
        viewer === undefined
            ? null
            : [...QUERY_MY_CONTRIBUTION_CALENDAR_SWR_KEY, viewer, year ?? "current"],
        async () => {
            const result = await queryMyContributionCalendar({
                request: year === undefined ? undefined : { year },
            })
            return result.data?.myContributionCalendar?.data ?? []
        },
    )
}
