/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { QUERY_CODING_PROBLEM_SWR_KEY, useQueryCodingProblemSwr } from "./useQueryCodingProblemSwr"

/**
 * What these tests guard: one problem is one cache entry, and no slug is no request - a key built
 * from `undefined` would ask the server for a problem that cannot exist and then cache the failure
 * where the real request would collide with it.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryCodingProblem: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("../../modules/api/graphql/queries/query-coding-problem", () => ({
    queryCodingProblem: mocks.queryCodingProblem,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One problem, trimmed to the fields the document selects. */
const problem = { slug: "two-sum", title: "Two Sum", difficulty: "easy" }

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryCodingProblem.mockReset()
    mocks.queryCodingProblem.mockResolvedValue({
        data: { codingProblem: { success: true, message: "ok", data: problem } },
    })
})

describe("useQueryCodingProblemSwr", () => {
    it("reads nothing before a slug is known", () => {
        renderHook(() => useQueryCodingProblemSwr())
        expect(keyOf()).toBeNull()
    })

    it("gives each problem its own cache entry", () => {
        renderHook(() => useQueryCodingProblemSwr("two-sum"))
        expect(keyOf()).toEqual([QUERY_CODING_PROBLEM_SWR_KEY, "two-sum"])

        renderHook(() => useQueryCodingProblemSwr("three-sum"))
        expect(keyOf()).toEqual([QUERY_CODING_PROBLEM_SWR_KEY, "three-sum"])
    })

    it("sends the slug and hands back the problem, not the envelope", async () => {
        renderHook(() => useQueryCodingProblemSwr("two-sum"))
        await expect(fetcherOf()()).resolves.toEqual(problem)
        expect(mocks.queryCodingProblem).toHaveBeenCalledWith({ request: { slug: "two-sum" } })
    })

    it("resolves to null for a slug the server does not know", async () => {
        mocks.queryCodingProblem.mockResolvedValue({
            data: { codingProblem: { success: false, message: "not found" } },
        })
        renderHook(() => useQueryCodingProblemSwr("nope"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryCodingProblem.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryCodingProblemSwr("two-sum"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("sends an empty slug rather than the word undefined if it is ever run without one", async () => {
        // The null key means SWR never runs the fetcher this way, but the fallback is what decides
        // what happens if it ever did - and `slug=undefined` on the wire is a request nobody can
        // read in a log, where an empty slug is at least an honest miss.
        mocks.queryCodingProblem.mockResolvedValue({
            data: { codingProblem: { success: false, message: "not found" } },
        })
        renderHook(() => useQueryCodingProblemSwr())
        await expect(fetcherOf()()).resolves.toBeNull()
        expect(mocks.queryCodingProblem).toHaveBeenCalledWith({ request: { slug: "" } })
    })
})
