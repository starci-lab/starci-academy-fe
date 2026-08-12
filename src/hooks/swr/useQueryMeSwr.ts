"use client"

import useSWR from "swr"
import { useViewerKey } from "../auth/useViewerKey"
import { queryMe } from "@/modules/api/graphql/queries/query-me"
import type { MeData } from "@/modules/api/graphql/queries/types/me"

/** Stable cache namespace for the authenticated identity query. */
export const QUERY_ME_SWR_KEY = ["QUERY_ME_SWR"]

/** Resolve the person represented by the current managed session. */
export const useQueryMeSwr = () => {
    const viewer = useViewerKey()
    return useSWR<MeData | null>(
        viewer === undefined ? null : [...QUERY_ME_SWR_KEY, viewer],
        async () => {
            const result = await queryMe()
            return result.data?.me?.data ?? null
        },
    )
}
