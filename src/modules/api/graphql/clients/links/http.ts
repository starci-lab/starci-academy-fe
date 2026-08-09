import { HttpLink } from "@apollo/client"
import { apiEnv } from "../../../env"
import { type GraphQLHeaders } from "../../types"

/** Everything the terminal link needs to reach the server. */
export interface CreateHttpLinkParams {
    /** Override the endpoint; defaults to `apiEnv().graphql.url`. */
    uri?: string
    /**
     * When true, cookies travel with the request (`credentials: "include"`).
     * Off by default: the anonymous path needs no cookie, and sending one to a
     * cross-origin API that has not opted in only produces a CORS failure.
     */
    withCredentials?: boolean
    /** Static headers merged into every request this link makes. */
    headers?: GraphQLHeaders
    /** Abort signal forwarded to `fetch`, so an unmounted caller actually releases the socket. */
    signal?: AbortSignal
}

/**
 * Resolves the arguments into the exact option object handed to `HttpLink`.
 *
 * This is a separate function because Apollo v4 keeps a link's options private: once
 * `new HttpLink(...)` has been built there is no way to read back which endpoint it will
 * call. Resolving first means the decision itself can be asserted, which is where the
 * mistakes live - a wrong endpoint or a leaked cookie is a configuration bug, not a
 * transport bug, and it is invisible until something reaches production.
 *
 * Undefined header values are stripped rather than passed through, because a header whose
 * value is the literal string "undefined" is worse than a missing one: the server sees a
 * real value and tries to parse it.
 */
export const resolveHttpLinkOptions = ({
    uri,
    withCredentials = false,
    headers = {},
    signal,
}: CreateHttpLinkParams = {}): HttpLink.Options => ({
    uri: uri ?? apiEnv().graphql.url,
    credentials: withCredentials ? "include" : "same-origin",
    headers: Object.fromEntries(
        Object.entries(headers).filter(([, value]) => value !== undefined),
    ) as Record<string, string>,
    fetchOptions: { signal },
})

/** The terminal link: it performs the actual HTTP POST and nothing else. */
export const createHttpLink = (params: CreateHttpLinkParams = {}) =>
    new HttpLink(resolveHttpLinkOptions(params))
