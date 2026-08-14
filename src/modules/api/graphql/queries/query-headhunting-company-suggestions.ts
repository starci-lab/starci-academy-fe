import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse, LookupQueryParams } from "../types"

/** One backend-ranked company typeahead match. */
export interface HeadhuntingCompanySuggestion {
    readonly id: string
    readonly label: string
}

interface QueryHeadhuntingCompanySuggestionsRequest {
    readonly query: string
    readonly limit?: number
}

interface QueryHeadhuntingCompanySuggestionsResponse {
    readonly headhuntingCompanySuggestions: GraphQLResponse<{
        readonly data: ReadonlyArray<HeadhuntingCompanySuggestion>
    }>
}

const query1 = gql`
    query HeadhuntingCompanySuggestions($request: SuggestionsRequest!) {
        headhuntingCompanySuggestions(request: $request) {
            success
            message
            error
            data { data { id label } }
        }
    }
`

export enum QueryHeadhuntingCompanySuggestions { Query1 = "query1" }

const queryHeadhuntingCompanySuggestionsMap: Record<QueryHeadhuntingCompanySuggestions, DocumentNode> = {
    [QueryHeadhuntingCompanySuggestions.Query1]: query1,
}

/** Reads backend-ranked company typeahead suggestions. */
export const queryHeadhuntingCompanySuggestions = async ({
    query = QueryHeadhuntingCompanySuggestions.Query1,
    request,
    headers,
    signal,
    debug,
}: LookupQueryParams<QueryHeadhuntingCompanySuggestions, QueryHeadhuntingCompanySuggestionsRequest>) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryHeadhuntingCompanySuggestionsResponse>({
        query: queryHeadhuntingCompanySuggestionsMap[query],
        variables: { request },
    })
}
