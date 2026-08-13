import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client"
import { type GraphQLHeaders } from "../types"
import { createRetryLink } from "./links/retry"
import { createTimeoutLink } from "./links/timeout"
import { createAttachBearerTokenLink } from "./links/bearer"
import { createAttachLocaleLink } from "./links/locale"
import { createHttpLink } from "./links/http"
import { defaultOptions } from "./options"

/** Everything a caller may vary about one client. */
export interface CreateApolloClientParams {
    /**
     * When true, the bearer-token link is inserted. Off by default: the anonymous chain is
     * the one nearly every query wants, and an unnecessary auth header is how a public
     * query starts failing for reasons nobody can see.
     */
    withAuth?: boolean
    /**
     * Include browser cookies. Defaults to the auth mode: authenticated requests must carry
     * StarCi's `session_id` cookie as well as the bearer token, while anonymous requests do not.
     */
    withCredentials?: boolean
    /** Override the endpoint; defaults to the environment. */
    uri?: string
    /** Extra headers for every operation on this client. */
    headers?: GraphQLHeaders
    /** Abort signal forwarded to `fetch`. */
    signal?: AbortSignal
    /** When true, the links log what they do. */
    debug?: boolean
}

/**
 * Builds the link chain, outermost first.
 *
 * The ORDER is the whole design and each position is load-bearing:
 *
 * 1. retry - outermost, so a flaky connection is retried before anything downstream forms
 *    an opinion about the failure;
 * 2. timeout - inside retry, so each individual attempt gets its own window rather than the
 *    whole retry budget sharing one;
 * 3. bearer - as late as possible, so the token is read at send time and a chain built
 *    before sign-in still sends the token that exists when the request actually goes out;
 * 4. http - terminal, because it is the only link that talks to the network. In auth mode it
 *    includes cookies too: StarCi's guard validates the bearer identity AND its `session_id`.
 *
 * Exported separately from the client so the chain can be asserted: a built `ApolloClient`
 * flattens its links and will not tell you which ones went in.
 */
export const createLinkChain = ({
    withAuth = false,
    withCredentials,
    uri,
    headers,
    signal,
    debug = false,
}: CreateApolloClientParams = {}): Array<ApolloLink> => [
    createRetryLink(),
    createTimeoutLink(),
    // Unconditional, unlike the bearer link: a guest reads in a language too, and the course
    // documents are stored per locale, so an anonymous request that declares none is served English
    // regardless of the address the reader is on.
    createAttachLocaleLink({ debug }),
    ...(withAuth ? [createAttachBearerTokenLink({ debug })] : []),
    createHttpLink({ uri, headers, signal, withCredentials: withCredentials ?? withAuth }),
]

/**
 * Builds a client for ONE operation.
 *
 * A fresh client per call looks wasteful and is not: the cache is disabled, so a client
 * carries no state worth keeping, while the abort signal and the headers belong to a single
 * request. A shared long-lived client would have to be rebuilt for each of those anyway, and
 * would quietly let one caller's abort signal cancel another caller's request.
 */
export const createApolloClient = (params: CreateApolloClientParams = {}) => new ApolloClient({
    link: ApolloLink.from(createLinkChain(params)),
    // Required by Apollo even when unused; `no-cache` means nothing is ever written to it.
    cache: new InMemoryCache(),
    defaultOptions,
})
