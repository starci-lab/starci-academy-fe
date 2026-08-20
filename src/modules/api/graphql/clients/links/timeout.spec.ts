import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ApolloLink, Observable } from "@apollo/client"
import { createTimeoutLink } from "./timeout"

/**
 * What these tests guard: the timer. Nothing here touches the network - a stand-in forward
 * function plays the part of the rest of the chain, so the only thing under test is whether
 * a silent downstream is turned into an error and whether the timer is always cleaned up.
 * A leaked timer is the failure that would fire a timeout at a caller which already left.
 */

/** A minimal stand-in for the operation object; the timeout link never reads any of its fields. */
const operation = {} as ApolloLink.Operation

/** A downstream that never answers - the exact condition the link exists to break. */
const silentForward = () => new Observable<ApolloLink.Result>(() => {})

/** A downstream that answers immediately with one result and completes. */
const answeringForward = () => new Observable<ApolloLink.Result>((observer) => {
    observer.next({ data: { ok: true } })
    observer.complete()
})

/** A downstream that fails outright - a refused socket rather than a silent one. */
const failingForward = () => new Observable<ApolloLink.Result>((observer) => {
    observer.error(new Error("connection refused"))
})

beforeEach(() => {
    vi.useFakeTimers()
})

afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
})

describe("createTimeoutLink", () => {
    it("errors once the configured window has passed with no answer", () => {
        vi.stubEnv("NEXT_PUBLIC_GRAPHQL_TIMEOUT", "1000")
        const errors: Array<Error> = []
        createTimeoutLink().request(operation, silentForward).subscribe({
            next: () => {},
            error: (error: Error) => errors.push(error),
        })
        vi.advanceTimersByTime(999)
        expect(errors).toHaveLength(0)
        vi.advanceTimersByTime(1)
        expect(errors).toHaveLength(1)
        expect(errors[0].message).toContain("timed out after 1000ms")
    })

    it("passes a result straight through and stops the timer", () => {
        vi.stubEnv("NEXT_PUBLIC_GRAPHQL_TIMEOUT", "1000")
        const seen: Array<ApolloLink.Result> = []
        let completed = false
        let failed = false
        createTimeoutLink().request(operation, answeringForward).subscribe({
            next: (value) => seen.push(value),
            error: () => {
                failed = true
            },
            complete: () => {
                completed = true
            },
        })
        expect(seen).toEqual([{ data: { ok: true } }])
        expect(completed).toBe(true)
        vi.advanceTimersByTime(5000)
        expect(failed).toBe(false)
    })

    it("passes a downstream failure through unchanged and stops the timer", () => {
        vi.stubEnv("NEXT_PUBLIC_GRAPHQL_TIMEOUT", "1000")
        const errors: Array<Error> = []
        createTimeoutLink().request(operation, failingForward).subscribe({
            next: () => {},
            error: (error: Error) => errors.push(error),
        })
        expect(errors).toHaveLength(1)
        expect(errors[0].message).toBe("connection refused")
        vi.advanceTimersByTime(5000)
        expect(errors).toHaveLength(1)
    })

    it("cancels the timer when the caller unsubscribes", () => {
        vi.stubEnv("NEXT_PUBLIC_GRAPHQL_TIMEOUT", "1000")
        let failed = false
        const subscription = createTimeoutLink().request(operation, silentForward).subscribe({
            next: () => {},
            error: () => {
                failed = true
            },
        })
        subscription.unsubscribe()
        vi.advanceTimersByTime(5000)
        expect(failed).toBe(false)
    })

    it("reads its window from the environment on each build", () => {
        vi.stubEnv("NEXT_PUBLIC_GRAPHQL_TIMEOUT", "20")
        const errors: Array<Error> = []
        createTimeoutLink().request(operation, silentForward).subscribe({
            next: () => {},
            error: (error: Error) => errors.push(error),
        })
        vi.advanceTimersByTime(20)
        expect(errors[0].message).toContain("timed out after 20ms")
    })
})
