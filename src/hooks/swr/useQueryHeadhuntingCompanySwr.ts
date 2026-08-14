import useSWR from "swr"
import { queryHeadhuntingCompany } from "@/modules/api/graphql/queries/query-headhunting-company"
import {
    type HeadhuntingCompany,
} from "@/modules/api/graphql/queries/query-headhunting-companies"

const QUERY_HEADHUNTING_COMPANY_SWR_KEY = "QUERY_HEADHUNTING_COMPANY_SWR"

/** Reads one company by UUID. */
export const useQueryHeadhuntingCompanySwr = (companyId?: string) => useSWR<HeadhuntingCompany | null>(
    companyId === undefined ? null : [QUERY_HEADHUNTING_COMPANY_SWR_KEY, companyId],
    async () => {
        if (companyId === undefined) throw new Error("Company id not found")
        return (await queryHeadhuntingCompany({ request: { id: companyId } })).data?.headhuntingCompany?.data ?? null
    },
)
