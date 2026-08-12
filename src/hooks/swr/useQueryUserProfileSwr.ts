"use client"

import useSWR from "swr"
import { queryUserProfile } from "@/modules/api/graphql/queries/query-user-profile"
import type { UserProfileData } from "@/modules/api/graphql/queries/types/user-profile"

/** Stable public-profile cache namespace. */
export const QUERY_USER_PROFILE_SWR_KEY = ["QUERY_USER_PROFILE_SWR"]

/** Resolve one public profile; null disables the request until the route is ready. */
export const useQueryUserProfileSwr = (username?: string | null) => useSWR<UserProfileData | null>(
    username ? [...QUERY_USER_PROFILE_SWR_KEY, username] : null,
    async () => {
        const result = await queryUserProfile({ request: { username: username! } })
        if (result.error !== undefined) throw result.error
        return result.data?.userProfile?.data ?? null
    },
)
