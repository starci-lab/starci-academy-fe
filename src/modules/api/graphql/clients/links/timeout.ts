import { ApolloLink, Observable } from "@apollo/client"
import { apiEnv } from "../../../env"

/**
 * Fails an operation that has not answered within `apiEnv().graphql.timeout`.
 *
 * A stalled socket is not the same failure as a refused one: `fetch` will happily wait for
 * a server that accepted the connection and then went quiet, so without this link a hung
 * request never resolves and never rejects, and the caller's loading state is permanent.
 *
 * Sits ABOVE the HTTP link so the timeout error travels back up through the retry link and
 * gets treated as the transient failure it usually is.
 */
export const createTimeoutLink = () => {
    const timeoutMs = apiEnv().graphql.timeout
    return new ApolloLink((operation, forward) =>
        new Observable<ApolloLink.Result>((observer) => {
            const timer = setTimeout(() => {
                observer.error(new Error(`GraphQL request timed out after ${timeoutMs}ms`))
            }, timeoutMs)
            const subscription = forward(operation).subscribe({
                next: (value) => observer.next(value),
                error: (error) => {
                    clearTimeout(timer)
                    observer.error(error)
                },
                complete: () => {
                    clearTimeout(timer)
                    observer.complete()
                },
            })
            // Unsubscribing must also cancel the pending timer, or an aborted operation
            // still throws a timeout into a caller that has already walked away.
            return () => {
                clearTimeout(timer)
                subscription.unsubscribe()
            }
        }),
    )
}
