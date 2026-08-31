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
     * The live session token always wins. This fallback exists only so a developer can prove an
     * authenticated operation without walking through sign-in; it is attached as
     * `authorization: Bearer <token>` when the in-memory session is absent.
     *
     * `undefined` when unset, which is the normal case: the anonymous path is the default.
     */
    bearerToken?: string
    /** When true, the links log what they do. Defaults to on; set `NEXT_PUBLIC_DEBUG=false` to silence. */
    debug: boolean
}

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"])

/**
 * `*.lvh.me` resolves to 127.0.0.1 and gives parallel UAT browser cases distinct cookie hosts.
 * Keep this deliberately narrow: no other suffix is considered local or eligible for rewriting.
 */
const isLoopbackHost = (hostname?: string): boolean =>
    typeof hostname === "string"
    && (LOOPBACK_HOSTS.has(hostname) || hostname === "lvh.me" || hostname.endsWith(".lvh.me"))

/**
 * Keep local API cookies on the canonical local host, except for isolated UAT cases.
 *
 * Browsers deliberately treat different loopback spellings as different cookie hosts. Normal
 * development therefore always uses `localhost`; only `*.lvh.me` UAT cases retain distinct hosts
 * so parallel cookie jars stay isolated. Deployed hosts and non-URL configuration remain verbatim.
 */
const alignLoopbackHost = (configured: string): string => {
    if (typeof window === "undefined" || !isLoopbackHost(window.location.hostname)) return configured
    try {
        const url = new URL(configured)
        if (!isLoopbackHost(url.hostname)) return configured
        url.hostname = window.location.hostname === "lvh.me" || window.location.hostname.endsWith(".lvh.me")
            ? window.location.hostname
            : "localhost"
        return url.toString()
    } catch {
        return configured
    }
}

/**
 * Reads the API layer's environment, applying a working local default to every value
 * except the token, which has no sensible default and stays `undefined` when unset.
 */
export const apiEnv = (): ApiEnv => {
    const bearerToken = process.env.NEXT_PUBLIC_API_BEARER_TOKEN
    return {
        graphql: {
            url: alignLoopbackHost(
                process.env.NEXT_PUBLIC_API_GRAPHQL_BASE_URL || "http://localhost:3001/graphql",
            ),
            maxRetry: Number(process.env.NEXT_PUBLIC_GRAPHQL_MAX_RETRY || 3),
            maxRetryDelay: Number(process.env.NEXT_PUBLIC_GRAPHQL_MAX_RETRY_DELAY || 1000),
            initialRetryDelay: Number(process.env.NEXT_PUBLIC_GRAPHQL_INITIAL_RETRY_DELAY || 300),
            timeout: Number(process.env.NEXT_PUBLIC_GRAPHQL_TIMEOUT || 300000),
        },
        bearerToken: bearerToken ? bearerToken : undefined,
        debug: process.env.NEXT_PUBLIC_DEBUG !== "false",
    }
}
