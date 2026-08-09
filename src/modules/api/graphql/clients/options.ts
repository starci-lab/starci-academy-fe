import { ApolloClient } from "@apollo/client"

/**
 * Apollo Client 4 will not accept an `errorPolicy` default until the app has DECLARED which
 * policy it means.
 *
 * The reason is inference, not ceremony: the policy decides whether a result can carry an
 * error alongside its data, so every query result type downstream is shaped by it. Left
 * undeclared, `ApolloClient.DefaultOptions` types `errorPolicy` as the sentinel `undefined`
 * and any literal is rejected - which is the whole of the error this declaration removes.
 * Declaring it here, once, is what lets the rest of the app read a partial result without
 * casting at every call site.
 *
 * The members are optional so that neither `query` nor `watchQuery` becomes a REQUIRED key
 * of the options object: a declaration with required members would force every future
 * defaults object to restate the policy.
 */
declare module "@apollo/client" {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace ApolloClient {
        // eslint-disable-next-line @typescript-eslint/no-namespace
        namespace DeclareDefaultOptions {
            /** The policy `client.query` runs under. */
            interface Query {
                /** Keep partial results; see {@link defaultOptions}. */
                errorPolicy?: "all"
            }
            /** The policy `client.watchQuery` runs under. */
            interface WatchQuery {
                /** Keep partial results; see {@link defaultOptions}. */
                errorPolicy?: "all"
            }
        }
    }
}

/**
 * Apollo's own caching is turned OFF here, on purpose.
 *
 * SWR is the cache layer in this app: it owns the key, the deduplication, the revalidation
 * and the shared state between components. Letting Apollo normalise and cache as well would
 * mean two caches with two invalidation rules over the same rows, and the loser of that race
 * is whichever one a reader happens to be looking at. One cache, one owner.
 *
 * `errorPolicy: "all"` matters just as much: the back end answers a partial failure with a
 * 200 carrying `success: false` in the envelope, and a stricter policy would throw that
 * envelope away before the caller ever sees the message meant for the reader.
 */
export const defaultOptions: ApolloClient.DefaultOptions = {
    query: {
        fetchPolicy: "no-cache",
        errorPolicy: "all",
    },
    watchQuery: {
        fetchPolicy: "no-cache",
        errorPolicy: "all",
    },
}
