import { describe, expect, it } from "vitest"
import { defaultOptions } from "./options"

/**
 * What these tests guard: the single-cache decision. If `fetchPolicy` ever drifts back to
 * a caching value, Apollo starts serving rows that SWR believes it already invalidated, and
 * the bug reads as "the page sometimes shows old data" - almost impossible to trace back to
 * one word in a config object.
 */

describe("defaultOptions", () => {
    it("leaves caching entirely to SWR", () => {
        expect(defaultOptions.query?.fetchPolicy).toBe("no-cache")
        expect(defaultOptions.watchQuery?.fetchPolicy).toBe("no-cache")
    })

    it("keeps partial failures instead of discarding the envelope", () => {
        expect(defaultOptions.query?.errorPolicy).toBe("all")
        expect(defaultOptions.watchQuery?.errorPolicy).toBe("all")
    })

    it("declares no mutation defaults, because this layer sends no mutations", () => {
        expect(defaultOptions.mutate).toBeUndefined()
    })
})
