import { RetryLink } from "@apollo/client/link/retry"
import { apiEnv } from "../../../env"

/**
 * Resolves the retry policy from the environment.
 *
 * Split out for the same reason as the HTTP options: a built link will not tell you how
 * many attempts it is going to make. The jitter is not decoration - without it every
 * client that saw the same outage retries on the same schedule and the recovering server
 * is hit by the whole fleet at once.
 */
export const resolveRetryLinkOptions = (): RetryLink.Options => {
    const { initialRetryDelay, maxRetryDelay, maxRetry } = apiEnv().graphql
    return {
        delay: {
            initial: initialRetryDelay,
            max: maxRetryDelay,
            jitter: true,
        },
        attempts: {
            max: maxRetry,
            /**
             * Retry on any transport-level failure. A GraphQL error never reaches here -
             * it arrives as a successful HTTP response carrying an `error` in the envelope,
             * and retrying a rejected mutation would be worse than failing.
             */
            retryIf: (error) => Boolean(error),
        },
    }
}

/**
 * Retries transient network failures with jittered exponential backoff.
 *
 * Sits FIRST in the chain so a flaky connection is retried before any other link forms an
 * opinion about the failure.
 */
export const createRetryLink = () => new RetryLink(resolveRetryLinkOptions())
