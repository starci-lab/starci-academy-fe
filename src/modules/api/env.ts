/**
 * Public environment consumed by the API layer.
 *
 * Every value is read from a `NEXT_PUBLIC_*` variable so it survives the client bundle,
 * and every reference is written out in full because Next.js inlines these statically -
 * a computed lookup such as `process.env[name]` would come back undefined in the browser.
 *
 * The values are read inside the function rather than at module scope so a test can stub
 * the environment before the first call, and so a server restart is enough to pick up a
 * changed variable during development.
 */

/** Transport settings for the GraphQL client: where to call, how long to wait, how often to retry. */
export interface GraphQLEnv {
    /** Absolute URL of the GraphQL endpoint, e.g. `http://localhost:3001/graphql`. */
    url: string
    /** Maximum number of attempts a single operation makes before the error surfaces. */
    maxRetry: number
    /** Upper bound in milliseconds for the jittered backoff between attempts. */
    maxRetryDelay: number
    /** Delay in milliseconds before the first retry; each further attempt backs off from it. */
    initialRetryDelay: number
    /** Milliseconds after which an in-flight operation is aborted with a timeout error. */
    timeout: number
}

/** The whole environment surface the API layer reads - nothing else in the app is allowed in here. */
export interface ApiEnv {
    /** GraphQL transport settings. */
    graphql: GraphQLEnv
    /**
     * DEVELOPMENT BEARER TOKEN PASS-THROUGH - not a login flow.
     *
     * This repository has no session, no Keycloak provider and no token refresh. When a
     * query needs an authenticated viewer, the token is pasted into the environment and
     * this value is attached verbatim as `authorization: Bearer <token>`. It exists so the
     * authenticated path is provable end to end before a real session lands, and it must
     * be replaced by a session-owned token getter when one exists.
     *
     * `undefined` when unset, which is the normal case: the anonymous path is the default.
     */
    bearerToken?: string
    /** When true, the links log what they do. Defaults to on; set `NEXT_PUBLIC_DEBUG=false` to silence. */
    debug: boolean
}

/**
 * Reads the API layer's environment, applying a working local default to every value
 * except the token, which has no sensible default and stays `undefined` when unset.
 */
export const apiEnv = (): ApiEnv => {
    const bearerToken = process.env.NEXT_PUBLIC_API_BEARER_TOKEN
    return {
        graphql: {
            url: process.env.NEXT_PUBLIC_API_GRAPHQL_BASE_URL || "http://localhost:3001/graphql",
            maxRetry: Number(process.env.NEXT_PUBLIC_GRAPHQL_MAX_RETRY || 3),
            maxRetryDelay: Number(process.env.NEXT_PUBLIC_GRAPHQL_MAX_RETRY_DELAY || 1000),
            initialRetryDelay: Number(process.env.NEXT_PUBLIC_GRAPHQL_INITIAL_RETRY_DELAY || 300),
            timeout: Number(process.env.NEXT_PUBLIC_GRAPHQL_TIMEOUT || 300000),
        },
        bearerToken: bearerToken ? bearerToken : undefined,
        debug: process.env.NEXT_PUBLIC_DEBUG !== "false",
    }
}
