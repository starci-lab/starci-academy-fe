"use client"

import useSWR from "swr"
import { queryMyCvBlocks } from "@/modules/api/graphql/queries/query-my-cv-blocks"
import type { CvDocument } from "@/modules/types/cv"

/** Stable authenticated CV-document cache namespace. */
export const QUERY_MY_CV_BLOCKS_SWR_KEY = "QUERY_MY_CV_BLOCKS_SWR"

/** Loads CV-builder documents only for the profile owner. */
export const useQueryMyCvBlocksSwr = (enabled: boolean) => useSWR<ReadonlyArray<CvDocument>>(
    enabled ? QUERY_MY_CV_BLOCKS_SWR_KEY : null,
    async () => {
        const result = await queryMyCvBlocks({})
        const response = result.data?.myCvBlocks
        if (!response || response.error != null) throw new Error(response?.message ?? "Không tải được dữ liệu CV.") // vn-ok: localized Vietnamese recovery copy.
        return response.data ?? []
    },
)
