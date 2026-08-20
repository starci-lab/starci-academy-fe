import { describe, expect, it } from "vitest"
import { type MutationParams } from "./params"

/**
 * What these tests guard: that `request` is REQUIRED. A query may sensibly default its
 * variables - the first page in the default order answers a caller with no opinion - but a
 * write has no such thing, and a mutation that could be sent with no argument is a mutation
 * that will eventually be sent with no argument.
 */

/** A stand-in for a real mutation's variant enum. */
type Variant = "mutation1"

/** A stand-in for a real mutation's request shape. */
interface Request {
    /** The one field of the stand-in request. */
    value: string
}

describe("MutationParams", () => {
    it("carries the request as the single argument object", () => {
        const params: MutationParams<Variant, Request> = { request: { value: "x" } }
        expect(params.request.value).toBe("x")
    })

    it("leaves the variant, headers, signal and debug optional", () => {
        const params: MutationParams<Variant, Request> = { request: { value: "x" } }
        expect(params.mutation).toBeUndefined()
        expect(params.headers).toBeUndefined()
        expect(params.signal).toBeUndefined()
        expect(params.debug).toBeUndefined()
    })

    it("carries an abort signal through unchanged", () => {
        const controller = new AbortController()
        const params: MutationParams<Variant, Request> = {
            request: { value: "x" },
            signal: controller.signal,
            headers: { "X-Locale": "en" },
            debug: true,
        }
        expect(params.signal).toBe(controller.signal)
        expect(params.headers).toEqual({ "X-Locale": "en" })
        expect(params.debug).toBe(true)
    })
})
