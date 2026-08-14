import useSWR from "swr"
import {
    queryHeadhuntingCompanySuggestions,
    type HeadhuntingCompanySuggestion,
} from "@/modules/api/graphql/queries/query-headhunting-company-suggestions"

const QUERY_HEADHUNTING_COMPANY_SUGGESTIONS_SWR_KEY = "QUERY_HEADHUNTING_COMPANY_SUGGESTIONS_SWR"

/** Reads typeahead matches only after a non-empty company query is submitted. */
export const useQueryHeadhuntingCompanySuggestionsSwr = (query: string) => useSWR<ReadonlyArray<HeadhuntingCompanySuggestion> | null>(
    query.trim() === "" ? null : [QUERY_HEADHUNTING_COMPANY_SUGGESTIONS_SWR_KEY, query.trim()],
    async () => (await queryHeadhuntingCompanySuggestions({
        request: { query: query.trim(), limit: 8 },
    })).data?.headhuntingCompanySuggestions?.data?.data ?? null,
)
