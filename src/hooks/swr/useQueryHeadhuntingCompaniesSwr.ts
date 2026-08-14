import useSWR from "swr"
import {
    queryHeadhuntingCompanies,
    type HeadhuntingCompany,
} from "@/modules/api/graphql/queries/query-headhunting-companies"

const QUERY_HEADHUNTING_COMPANIES_SWR_KEY = "QUERY_HEADHUNTING_COMPANIES_SWR"

/** Reads the company directory in backend display order. */
export const useQueryHeadhuntingCompaniesSwr = () => useSWR<ReadonlyArray<HeadhuntingCompany> | null>(
    QUERY_HEADHUNTING_COMPANIES_SWR_KEY,
    async () => (await queryHeadhuntingCompanies()).data?.headhuntingCompanies?.data ?? null,
)
