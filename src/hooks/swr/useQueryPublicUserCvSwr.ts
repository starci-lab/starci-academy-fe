"use client"

import useSWR from "swr"
import { queryPublicUserCv } from "@/modules/api/graphql/queries/query-public-user-cv"
import type { PublicUserCvData } from "@/modules/api/graphql/queries/types/user-profile"

/** Stable public-CV cache namespace. */
export const QUERY_PUBLIC_USER_CV_SWR_KEY = ["QUERY_PUBLIC_USER_CV_SWR"]

/** Resolve the CV marked public for one username. */
export const useQueryPublicUserCvSwr = (username?: string | null) => useSWR<PublicUserCvData | null>(
    username ? [...QUERY_PUBLIC_USER_CV_SWR_KEY, username] : null,
    async () => {
        const result = await queryPublicUserCv({ request: { username: username! } })
        if (result.error !== undefined) throw result.error
        return result.data?.publicUserCv?.data ?? null
    },
)
