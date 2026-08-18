/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { QUERY_FOUNDATIONS_SWR_KEY, useQueryFoundationsSwr } from "./useQueryFoundationsSwr"

/**
 * What these tests guard: the category is required before anything is read, the ordering is fixed
 * by the author's own sort index rather than by whatever the server returns first, and an empty
 * search travels as an absence rather than as a filter that matches nothing.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryFoundations: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-foundations", () => ({
    queryFoundations: mocks.queryFoundations,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One page of foundations, trimmed to the fields the document selects. */
const page = { data: [{ id: "foundation-1", label: "HTTP" }], total: 1 }

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryFoundations.mockReset()
    mocks.queryFoundations.mockResolvedValue({
        data: { foundations: { success: true, message: "ok", data: page } },
    })
})

describe("useQueryFoundationsSwr", () => {
    it("reads nothing before a category is chosen", () => {
        renderHook(() => useQueryFoundationsSwr({}))
        expect(keyOf()).toBeNull()
    })

    it("names the category and every default in the key", () => {
        renderHook(() => useQueryFoundationsSwr({ categoryId: "category-1" }))
        expect(keyOf()).toEqual([QUERY_FOUNDATIONS_SWR_KEY, "category-1", "", 1, 24])

        renderHook(() => useQueryFoundationsSwr({ categoryId: "category-2" }))
        expect(keyOf()).toEqual([QUERY_FOUNDATIONS_SWR_KEY, "category-2", "", 1, 24])
    })

    it("sends no search at all when nothing was typed, and keeps the author's order", async () => {
        renderHook(() => useQueryFoundationsSwr({ categoryId: "category-1" }))
        await expect(fetcherOf()()).resolves.toEqual(page)
        expect(mocks.queryFoundations).toHaveBeenCalledWith({
            request: {
                categoryId: "category-1",
                filters: {
                    pageNumber: 1,
                    limit: 24,
                    search: undefined,
                    sorts: [{ by: "sortIndex", order: "ASC" }],
                },
            },
        })
    })

    it("sends the search, page and limit when they are given", async () => {
        renderHook(() => useQueryFoundationsSwr({
            categoryId: "category-1", search: "http", pageNumber: 3, limit: 8,
        }))
        await fetcherOf()()
        const sent = mocks.queryFoundations.mock.calls[0][0].request.filters
        expect(sent.search).toBe("http")
        expect(sent.pageNumber).toBe(3)
        expect(sent.limit).toBe(8)
    })

    it("resolves to null when the server answered without a page", async () => {
        mocks.queryFoundations.mockResolvedValue({
            data: { foundations: { success: false, message: "unavailable" } },
        })
        renderHook(() => useQueryFoundationsSwr({ categoryId: "category-1" }))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryFoundations.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryFoundationsSwr({ categoryId: "category-1" }))
        await expect(fetcherOf()()).resolves.toBeNull()
    })
})
