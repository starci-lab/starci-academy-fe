import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLHeaders, GraphQLResponse } from "../types"

/** One compact playground catalog row. */
export type PlaygroundSummary = {
    readonly id: string
    readonly slug: string
    readonly title: string
    readonly icon: string | null
    readonly stepCount: number
}

type QueryPlaygroundsResponse = { readonly playgrounds: GraphQLResponse<ReadonlyArray<PlaygroundSummary>> }
const document = gql`query Playgrounds($courseId: ID!) { playgrounds(courseId: $courseId) { success message error data { id slug title icon stepCount } } }`
/** Selects course playground definitions in the shared GraphQL executor. */
export enum QueryPlaygrounds { Query1 = "query1" }
/** Transport inputs for listing a course's playgrounds. */
export type QueryPlaygroundsParams = { readonly courseId: string; readonly headers?: GraphQLHeaders; readonly signal?: AbortSignal; readonly debug?: boolean }

/** List live playground exercises for the resolved course primary key. */
export const queryPlaygrounds = async ({ courseId, headers, signal, debug }: QueryPlaygroundsParams) =>
    createApolloClient({ headers, signal, debug }).query<QueryPlaygroundsResponse>({ query: document, variables: { courseId } })
