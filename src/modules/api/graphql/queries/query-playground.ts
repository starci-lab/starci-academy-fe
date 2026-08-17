import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { GraphQLHeaders, GraphQLResponse } from "../types"

/** One learner-facing step with no server verify predicate exposed. */
export type PlaygroundStep = { readonly id: string; readonly sortIndex: number; readonly title: string; readonly body: string; readonly commandHint: string | null; readonly actionHint: string | null }
/** One localized playground definition and its ordered steps. */
export type Playground = { readonly id: string; readonly slug: string; readonly title: string; readonly description: string | null; readonly icon: string | null; readonly kind: string; readonly steps: ReadonlyArray<PlaygroundStep> }
type QueryPlaygroundResponse = { readonly playground: GraphQLResponse<Playground> }
const document = gql`query Playground($slug: String!) { playground(slug: $slug) { success message error data { id slug title description icon kind steps { id sortIndex title body commandHint actionHint } } } }`
/** Selects one playground definition in the shared GraphQL executor. */
export enum QueryPlayground { Query1 = "query1" }
/** Transport inputs for resolving one playground by slug. */
export type QueryPlaygroundParams = { readonly slug: string; readonly headers?: GraphQLHeaders; readonly signal?: AbortSignal; readonly debug?: boolean }

/** Read one localized playground and its ordered guided steps. */
export const queryPlayground = async ({ slug, headers, signal, debug }: QueryPlaygroundParams) =>
    createApolloClient({ headers, signal, debug }).query<QueryPlaygroundResponse>({ query: document, variables: { slug } })
