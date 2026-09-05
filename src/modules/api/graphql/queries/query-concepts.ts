import { gql } from "@apollo/client"
import { createApolloClient } from "../clients/create-apollo-client"
import type { QueryParams } from "../types"
import type { QueryConceptsResponse } from "./types/concept"

const document = gql`
    query Concepts($request: ConceptsRequest) {
        concepts(request: $request) {
            success
            message
            error
            data {
                displayId
                title
                description
                category
                difficulty
                minutesRead
                implementation
                sortIndex
            }
        }
    }
`

/** The public standalone-concept catalog. */
export enum QueryConcepts { Query1 = "query1" }

/** Read every V1 concept in server order. */
export const queryConcepts = async ({ headers, signal, debug }: QueryParams<QueryConcepts, Record<never, never>> = {}) =>
    createApolloClient({ headers, signal, debug }).query<QueryConceptsResponse>({
        query: document,
        variables: { request: {} },
    })
