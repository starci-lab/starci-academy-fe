/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    QUERY_FOUNDATION_CATEGORIES_SWR_KEY,
    useQueryFoundationCategoriesSwr,
} from "./useQueryFoundationCategoriesSwr"

/**
 * What these tests guard: the empty search is `""` in the KEY and `undefined` on the WIRE. The key
 * needs a value so page one is one entry; the request needs the absence, because a server reading
 * `search: ""` filters to nothing and the reader gets an empty catalog for typing nothing.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryFoundationCategories: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-foundation-categories", () => ({
    queryFoundationCategories: mocks.queryFoundationCategories,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One page of categories, trimmed to the fields the document selects. */
const page = { data: [{ id: "category-1", label: "Backend" }], total: 1 }

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryFoundationCategories.mockReset()
    mocks.queryFoundationCategories.mockResolvedValue({
        data: { foundationCategories: { success: true, message: "ok", data: page } },
    })
})

describe("useQueryFoundationCategoriesSwr", () => {
    it("names every default in the key, so page one is one entry", () => {
        renderHook(() => useQueryFoundationCategoriesSwr())
        expect(keyOf()).toEqual([QUERY_FOUNDATION_CATEGORIES_SWR_KEY, "", 1, 24])
    })

    it("gives a search, a page and a limit their own cache entries", () => {
        renderHook(() => useQueryFoundationCategoriesSwr())
        const resting = keyOf()

        renderHook(() => useQueryFoundationCategoriesSwr({ search: "backend" }))
        expect(keyOf()).not.toEqual(resting)

        renderHook(() => useQueryFoundationCategoriesSwr({ pageNumber: 2 }))
        expect(keyOf()).not.toEqual(resting)

        renderHook(() => useQueryFoundationCategoriesSwr({ limit: 6 }))
        expect(keyOf()).not.toEqual(resting)
    })

    it("sends no search at all when nothing was typed", async () => {
        renderHook(() => useQueryFoundationCategoriesSwr())
        await expect(fetcherOf()()).resolves.toEqual(page)
        expect(mocks.queryFoundationCategories).toHaveBeenCalledWith({
            request: { search: undefined, pageNumber: 1, limit: 24 },
        })
    })

    it("sends the search when there is one", async () => {
        renderHook(() => useQueryFoundationCategoriesSwr({ search: "backend", pageNumber: 2, limit: 6 }))
        await fetcherOf()()
        expect(mocks.queryFoundationCategories).toHaveBeenCalledWith({
            request: { search: "backend", pageNumber: 2, limit: 6 },
        })
    })

    it("resolves to null when the server answered without a page", async () => {
        mocks.queryFoundationCategories.mockResolvedValue({
            data: { foundationCategories: { success: false, message: "unavailable" } },
        })
        renderHook(() => useQueryFoundationCategoriesSwr())
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryFoundationCategories.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryFoundationCategoriesSwr())
        await expect(fetcherOf()()).resolves.toBeNull()
    })
})
