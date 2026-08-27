import { gql, type DocumentNode } from "@apollo/client"
import { createApolloClient } from "@/modules/api/graphql/clients/create-apollo-client"
import { type QueryParams } from "@/modules/api/graphql/types"
import { type QueryContentRequest, type QueryContentResponse } from "@/modules/api/graphql/queries/types/content"

/**
 * One content, by id.
 *
 * AUTHENTICATED, unlike the course beside it. The server guards this query with Keycloak and
 * truncates a premium body for a viewer who is not entitled, so the answer is already personal:
 * two readers asking for the same content can legitimately receive different bodies. That is why
 * the viewer belongs in the cache key of the hook above this, and why the client is built with auth
 * rather than optionally attaching it.
 *
 * WHAT IT SELECTS AND WHY. The body and title are the reading. `isPremium` is what
 * turns a short body into a paywall rather than a short lesson - without it the page cannot tell a
 * truncated content from a brief one. `orderIndex` is the reader's place in the module. The module
 * outline is fetched by its own query because the content handler does not load that relation.
 */
const query1 = gql`
    query Content($request: ContentRequest!) {
        content(request: $request) {
            success
            message
            error
            data {
                id
                displayId
                title
                description
                body
                bodies {
                    id
                    lang
                    orderIndex
                    body
                    defaultLocale
                    translations {
                        locale
                        body
                    }
                }
                isPremium
                isSandbox
                githubBaseUrl
                githubDir
                backendUrl
                minutesRead
                orderIndex
                challenges {
                    id
                    displayId
                    title
                    description
                    score
                    difficulty
                    orderIndex
                    hint
                    requirements {
                        id
                        orderIndex
                        sortIndex
                        langs {
                            lang
                            orderIndex
                            sortIndex
                            score
                            title
                            body
                        }
                    }
                    steps {
                        id
                        orderIndex
                        sortIndex
                        langs {
                            lang
                            orderIndex
                            sortIndex
                            title
                            body
                        }
                    }
                    outputs {
                        id
                        orderIndex
                        sortIndex
                        langs {
                            lang
                            orderIndex
                            sortIndex
                            text
                        }
                    }
                    prerequisites {
                        id
                        orderIndex
                        sortIndex
                        langs {
                            lang
                            orderIndex
                            sortIndex
                            text
                        }
                    }
                    submissions {
                        id
                        title
                        description
                        score
                        sortIndex
                    }
                }
            }
        }
    }
`

/** The document variants of this query. */
export enum QueryContent {
    /** The full reader selection. */
    Query1 = "query1",
}

/** Every document this query can send, keyed by variant. */
export const queryContentMap: Record<QueryContent, DocumentNode> = {
    [QueryContent.Query1]: query1,
}

/** Fetches one content. Requires a bearer token - the server refuses an anonymous read. */
export const queryContent = async ({
    query = QueryContent.Query1,
    request = {},
    headers,
    signal,
    debug,
}: QueryParams<QueryContent, QueryContentRequest> = {}) => {
    const apollo = createApolloClient({ withAuth: true, headers, signal, debug })
    return apollo.query<QueryContentResponse>({
        query: queryContentMap[query],
        variables: { request },
    })
}
