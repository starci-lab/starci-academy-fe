import { afterEach, describe, expect, it, vi } from "vitest"
import { RetryLink } from "@apollo/client/link/retry"
import { createRetryLink, resolveRetryLinkOptions } from "./retry"

/**
 * What these tests guard: the retry budget comes from the environment, and jitter stays on.
 * A retry policy that silently falls back to a default is the kind of thing nobody notices
 * until an outage, because in the happy path it never runs at all.
 */

/** The delay half of the policy, narrowed from the object-or-function union the type allows. */
const delayOptionsOf = (options: RetryLink.Options): RetryLink.DelayOptions =>
    options.delay as RetryLink.DelayOptions

/** The attempts half of the policy, narrowed the same way. */
const attemptsOptionsOf = (options: RetryLink.Options): RetryLink.AttemptsOptions =>
    options.attempts as RetryLink.AttemptsOptions

afterEach(() => {
    vi.unstubAllEnvs()
})

describe("resolveRetryLinkOptions", () => {
    it("reads the whole budget from the environment", () => {
        vi.stubEnv("NEXT_PUBLIC_GRAPHQL_MAX_RETRY", "7")
        vi.stubEnv("NEXT_PUBLIC_GRAPHQL_INITIAL_RETRY_DELAY", "50")
        vi.stubEnv("NEXT_PUBLIC_GRAPHQL_MAX_RETRY_DELAY", "5000")
        const options = resolveRetryLinkOptions()
        expect(delayOptionsOf(options).initial).toBe(50)
        expect(delayOptionsOf(options).max).toBe(5000)
        expect(attemptsOptionsOf(options).max).toBe(7)
    })

    it("keeps jitter on so a fleet does not retry in lockstep", () => {
        expect(delayOptionsOf(resolveRetryLinkOptions()).jitter).toBe(true)
    })

    it("retries when there is an error and stops when there is none", () => {
        const { retryIf } = attemptsOptionsOf(resolveRetryLinkOptions())
        expect(retryIf).toBeTypeOf("function")
        const operation = {} as Parameters<NonNullable<typeof retryIf>>[1]
        expect(retryIf?.(new Error("offline"), operation)).toBe(true)
        expect(retryIf?.(undefined as unknown as Error, operation)).toBe(false)
    })
})

describe("createRetryLink", () => {
    it("builds a RetryLink", () => {
        expect(createRetryLink()).toBeInstanceOf(RetryLink)
    })
})
