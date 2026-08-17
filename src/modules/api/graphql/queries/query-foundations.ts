import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { QueryParams, SortInput } from "../types"

/** One localized technical foundation resource. */
export type Foundation = {
    readonly id: string
    readonly displayId: string
    readonly title: string
    readonly description: string | null
    readonly kind: "external_link" | "video" | "document"
    readonly value: string | null
    readonly sortIndex: number
    readonly isRecommended: boolean
    readonly author: string | null
    readonly thumbnailUrl: string | null
    readonly categoryId: string
    readonly tags: ReadonlyArray<{ readonly id: string; readonly value: string; readonly sortIndex: number }>
}

/** Paginated foundation resources returned for one category. */
export type FoundationsPage = { readonly count: number; readonly data: ReadonlyArray<Foundation> }
/** Backend-supported sort fields for foundation resources. */
export type FoundationsSortBy = "title" | "sortIndex" | "createdAt" | "updatedAt"
/** Category, search, pagination and sort request for foundation resources. */
export type FoundationsRequest = {
    readonly categoryId: string
    readonly filters?: {
        readonly pageNumber?: number
        readonly limit?: number
        readonly search?: string
        readonly sorts: ReadonlyArray<SortInput<FoundationsSortBy>>
    }
}
type QueryFoundationsResponse = { readonly foundations: { readonly data: FoundationsPage } }

const document = gql`
    query Foundations($request: FoundationsRequest!) {
        foundations(request: $request) {
            data {
                count
                data {
                    id
                    displayId
                    title
                    description
                    kind
                    value
                    sortIndex
                    isRecommended
                    author
                    thumbnailUrl
                    categoryId
                    tags { id value sortIndex }
                }
            }
        }
    }
`

/** Selects learning foundations in the shared GraphQL executor. */
export enum QueryFoundations { Query1 = "query1" }

/** Read the localized resources inside one foundation category. */
export const queryFoundations = async ({ request, headers, signal, debug }: QueryParams<QueryFoundations, FoundationsRequest>) =>
    createApolloClient({ headers, signal, debug }).query<QueryFoundationsResponse>({
        query: document,
        variables: { request },
    })
