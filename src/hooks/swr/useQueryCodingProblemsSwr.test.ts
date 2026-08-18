/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { QUERY_CODING_PROBLEMS_SWR_KEY, useQueryCodingProblemsSwr } from "./useQueryCodingProblemsSwr"

/**
 * What these tests guard: the KEY is filled in where the request is not. Page one of every domain
 * has to be its own cache entry, so the key substitutes `""` and `1` and `50` for the absent
 * arguments - while the request keeps them `undefined`, because the server reads an absent filter
 * as "no filter" and an empty one as "match nothing".
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryCodingProblems: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("../../modules/api/graphql/queries/query-coding-problems", () => ({
    queryCodingProblems: mocks.queryCodingProblems,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One page of problems, trimmed to the fields the document selects. */
const page = { data: [{ slug: "two-sum", difficulty: "easy" }], total: 1 }

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryCodingProblems.mockReset()
    mocks.queryCodingProblems.mockResolvedValue({
        data: { codingProblems: { success: true, message: "ok", data: page } },
    })
})

describe("useQueryCodingProblemsSwr", () => {
    it("names every unfiltered default in the key, so page one is one entry", () => {
        renderHook(() => useQueryCodingProblemsSwr())
        expect(keyOf()).toEqual([QUERY_CODING_PROBLEMS_SWR_KEY, "", 1, 50])
    })

    it("gives a domain, a page and a limit their own cache entries", () => {
        renderHook(() => useQueryCodingProblemsSwr())
        const resting = keyOf()

        renderHook(() => useQueryCodingProblemsSwr({ domain: "arrays" }))
        expect(keyOf()).not.toEqual(resting)

        renderHook(() => useQueryCodingProblemsSwr({ page: 2 }))
        expect(keyOf()).not.toEqual(resting)

        renderHook(() => useQueryCodingProblemsSwr({ limit: 10 }))
        expect(keyOf()).not.toEqual(resting)
    })

    it("leaves the filters undefined in the request rather than sending the key's stand-ins", async () => {
        renderHook(() => useQueryCodingProblemsSwr())
        await expect(fetcherOf()()).resolves.toEqual(page)
        expect(mocks.queryCodingProblems).toHaveBeenCalledWith({
            request: { filters: { domain: undefined, page: undefined, limit: undefined } },
        })
    })

    it("sends the filters it was given", async () => {
        renderHook(() => useQueryCodingProblemsSwr({ domain: "arrays", page: 2, limit: 10 }))
        await fetcherOf()()
        expect(mocks.queryCodingProblems).toHaveBeenCalledWith({
            request: { filters: { domain: "arrays", page: 2, limit: 10 } },
        })
    })

    it("resolves to null when the server answered without a page", async () => {
        mocks.queryCodingProblems.mockResolvedValue({
            data: { codingProblems: { success: false, message: "unavailable" } },
        })
        renderHook(() => useQueryCodingProblemsSwr())
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryCodingProblems.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryCodingProblemsSwr())
        await expect(fetcherOf()()).resolves.toBeNull()
    })
})
