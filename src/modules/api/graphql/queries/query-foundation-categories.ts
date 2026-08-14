import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLResponse, QueryParams } from "../types"

/** One localized foundation category returned by the public catalog. */
export type FoundationCategory = {
    readonly id: string
    readonly displayId: string
    readonly slug: string | null
    readonly title: string
    readonly description: string | null
    readonly thumbnailUrl: string | null
    readonly orderIndex: number
    readonly sortIndex: number
}

/** Paginated foundation category result with its total count. */
export type FoundationCategoriesPage = {
    readonly totalCount: number
    readonly data: ReadonlyArray<FoundationCategory>
}

/** Public search and pagination request for foundation categories. */
export type FoundationCategoriesRequest = {
    readonly pageNumber?: number
    readonly limit?: number
    readonly search?: string
}

type QueryFoundationCategoriesResponse = {
    readonly foundationCategories: GraphQLResponse<FoundationCategoriesPage>
}

const document = gql`
    query FoundationCategories($request: FoundationCategoriesRequest) {
        foundationCategories(request: $request) {
            success
            message
            error
            data {
                totalCount
                data {
                    id
                    displayId
                    slug
                    title
                    description
                    thumbnailUrl
                    orderIndex
                    sortIndex
                }
            }
        }
    }
`

export enum QueryFoundationCategories { Query1 = "query1" }

/** Read the localized, server-filtered foundation category page. */
export const queryFoundationCategories = async ({ request, headers, signal, debug }: QueryParams<QueryFoundationCategories, FoundationCategoriesRequest> = {}) =>
    createApolloClient({ headers, signal, debug }).query<QueryFoundationCategoriesResponse>({
        query: document,
        variables: { request },
    })
