import useSWR from "swr"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import {
    queryConsultants,
    type ConsultantsPage,
} from "@/modules/api/graphql/queries/query-consultants"

const QUERY_CONSULTANTS_SWR_KEY = "QUERY_CONSULTANTS_SWR"

/** Reads one company's viewer-gated consultant directory. */
export const useQueryConsultantsSwr = (companyId?: string, search = "") => {
    const viewer = useViewerKey()
    return useSWR<ConsultantsPage | null>(
        companyId === undefined || viewer === undefined
            ? null
            : [QUERY_CONSULTANTS_SWR_KEY, companyId, search, viewer],
        async () => {
            if (companyId === undefined) throw new Error("Company id not found")
            const result = await queryConsultants({
                request: {
                    companyId,
                    filters: {
                        pageNumber: 1,
                        limit: 100,
                        ...(search === "" ? {} : { search }),
                        sorts: [{ by: "sortIndex", order: "ASC" }],
                    },
                },
            })
            return result.data?.consultants?.data ?? null
        },
    )
}
