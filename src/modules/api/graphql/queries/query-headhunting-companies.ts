import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse, QueryParams } from "../types"

/** Public company fields exposed by the headhunting directory. */
export interface HeadhuntingCompany {
    readonly id: string
    readonly displayId: string
    readonly title: string
    readonly description: string | null
    readonly websiteUrl: string | null
    readonly logoUrl: string | null
    readonly address: string | null
    readonly phone: string | null
    readonly email: string | null
    readonly facebookUrl: string | null
    readonly linkedinUrl: string | null
    readonly sortIndex: number
}

interface QueryHeadhuntingCompaniesResponse {
    readonly headhuntingCompanies: GraphQLResponse<ReadonlyArray<HeadhuntingCompany>>
}

const query1 = gql`
    query HeadhuntingCompanies {
        headhuntingCompanies {
            success
            message
            error
            data {
                id
                displayId
                title
                description
                websiteUrl
                logoUrl
                address
                phone
                email
                facebookUrl
                linkedinUrl
                sortIndex
            }
        }
    }
`

/** Selects headhunting companies in the shared GraphQL executor. */
export enum QueryHeadhuntingCompanies { Query1 = "query1" }

const queryHeadhuntingCompaniesMap: Record<QueryHeadhuntingCompanies, DocumentNode> = {
    [QueryHeadhuntingCompanies.Query1]: query1,
}

/** Reads the backend-ordered company directory. */
export const queryHeadhuntingCompanies = async ({
    query = QueryHeadhuntingCompanies.Query1,
    headers,
    signal,
    debug,
}: QueryParams<QueryHeadhuntingCompanies> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryHeadhuntingCompaniesResponse>({
        query: queryHeadhuntingCompaniesMap[query],
    })
}
