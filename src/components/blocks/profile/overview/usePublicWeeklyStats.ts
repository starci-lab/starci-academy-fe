"use client"

import { gql } from "@apollo/client"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import { createApolloClient } from "@/modules/api/graphql/clients/create-apollo-client"

type WeeklyStats = { readonly streak: number, readonly longestStreak: number }
type WeeklyStatsResponse = { readonly userWeeklyStats?: { readonly data?: WeeklyStats | null } }
const document = gql`query ProfileWeeklyStats($userId: ID!) { userWeeklyStats(userId: $userId) { success message error data { streak longestStreak } } }`

/** Resolve the public streak fields omitted from the contribution-calendar query. */
export const usePublicWeeklyStats = () => {
    const params = useParams<{ username?: string }>()
    const profile = useQueryUserProfileSwr(String(params.username ?? ""))
    const userId = profile.data?.id
    const request = useSWR<WeeklyStats>(userId ? ["QUERY_PROFILE_WEEKLY_STATS", userId] : null, async () => {
        const result = await createApolloClient({ withAuth: true }).query<WeeklyStatsResponse>({ query: document, variables: { userId }, fetchPolicy: "no-cache" })
        return result.data?.userWeeklyStats?.data ?? { streak: 0, longestStreak: 0 }
    })
    return { ...request, isLoading: profile.isLoading || request.isLoading }
}
