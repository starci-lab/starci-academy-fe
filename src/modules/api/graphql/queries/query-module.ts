import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "@/modules/api/graphql/clients/create-apollo-client"
import { type QueryParams } from "@/modules/api/graphql/types"
import { type ContentSibling } from "@/modules/api/graphql/queries/types/content"
import { type GraphQLResponse } from "@/modules/api/graphql/types"

/**
 * One module and the contents inside it - the reader's map of where it is.
 *
 * IT IS A SECOND REQUEST ON PURPOSE. The content query answers "what am I reading"; this answers
 * "what else is in this module", and they change at different rates: paging to the next content
 * replaces the first answer while the second is still exactly true. Folding them into one document
 * would re-fetch the whole module on every page turn, and the map would blink each time the reader
 * moved inside it.
 *
 * LOGIN-ONLY RATHER THAN ENROLMENT-GATED, which the server states in as many words: a trial reader
 * may see the shape of a module without being able to open its premium contents. So the map is
 * drawn for a viewer who cannot read half of it, and `isPremium` per content is what lets the rows
 * say which half.
 */
const query1 = gql`
    query Module($request: ModuleRequest!) {
        module(request: $request) {
            success
            message
            error
            data {
                id
                displayId
                title
                numContents
                contents {
                    id
                    title
                    minutesRead
                    isPremium
                    orderIndex
                }
            }
        }
    }
`

/** One module, as the map selects it. */
export interface ModuleDetail {
    /** Stable identity. */
    id: string
    /** The human-facing identifier. */
    displayId: string
    /** The already-resolved module title. */
    title: string
    /** How many contents it holds. */
    numContents: number
    /** Its contents, in the order the module sets. */
    contents: Array<ContentSibling>
}

/** What the caller must say about the module it wants. Exactly one of the two. */
export interface QueryModuleRequest {
    /** The module's primary id. */
    id?: string
    /** The module's display id. */
    displayId?: string
}

/** The envelope the server returns. */
export interface QueryModuleResponse {
    /** The single-module answer. */
    module: GraphQLResponse<ModuleDetail>
}

/** The document variants of this query. */
export enum QueryModule {
    /** The map selection. */
    Query1 = "query1",
}

/** Every document this query can send, keyed by variant. */
export const queryModuleMap: Record<QueryModule, DocumentNode> = {
    [QueryModule.Query1]: query1,
}

/** Fetches one module with its contents. */
export const queryModule = async ({
    query = QueryModule.Query1,
    request = {},
    headers,
    signal,
    debug,
}: QueryParams<QueryModule, QueryModuleRequest> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryModuleResponse>({
        query: queryModuleMap[query],
        variables: { request },
    })
}
