/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useQueryHeadhuntingCompanySuggestionsSwr } from "./useQueryHeadhuntingCompanySuggestionsSwr"

/**
 * What these tests guard: the query is TRIMMED in both the key and the request, so " acme " and
 * "acme" are one cache entry and one request rather than two; and a query that is only whitespace
 * asks for nothing at all, because an autocomplete that fires on a space is an autocomplete that
 * fires on every keystroke of an empty box.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryHeadhuntingCompanySuggestions: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-headhunting-company-suggestions", () => ({
    queryHeadhuntingCompanySuggestions: mocks.queryHeadhuntingCompanySuggestions,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One suggestion, two levels below the envelope. */
const rows = [{ id: "company-1", name: "Acme" }]

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryHeadhuntingCompanySuggestions.mockReset()
    mocks.queryHeadhuntingCompanySuggestions.mockResolvedValue({
        data: {
            headhuntingCompanySuggestions: {
                success: true, message: "ok", data: { data: rows, total: 1 },
            },
        },
    })
})

describe("useQueryHeadhuntingCompanySuggestionsSwr", () => {
    it("suggests nothing for an empty or whitespace-only query", () => {
        renderHook(() => useQueryHeadhuntingCompanySuggestionsSwr(""))
        expect(keyOf()).toBeNull()

        renderHook(() => useQueryHeadhuntingCompanySuggestionsSwr("   "))
        expect(keyOf()).toBeNull()
    })

    it("trims the query into the key, so the same search is one cache entry", () => {
        renderHook(() => useQueryHeadhuntingCompanySuggestionsSwr("  acme "))
        expect(keyOf()).toEqual(["QUERY_HEADHUNTING_COMPANY_SUGGESTIONS_SWR", "acme"])

        renderHook(() => useQueryHeadhuntingCompanySuggestionsSwr("acme"))
        expect(keyOf()).toEqual(["QUERY_HEADHUNTING_COMPANY_SUGGESTIONS_SWR", "acme"])
    })

    it("sends the trimmed query with a short suggestion limit", async () => {
        renderHook(() => useQueryHeadhuntingCompanySuggestionsSwr("  acme "))
        await expect(fetcherOf()()).resolves.toEqual(rows)
        expect(mocks.queryHeadhuntingCompanySuggestions).toHaveBeenCalledWith({
            request: { query: "acme", limit: 8 },
        })
    })

    it("resolves to null when the server answered without a page", async () => {
        mocks.queryHeadhuntingCompanySuggestions.mockResolvedValue({
            data: { headhuntingCompanySuggestions: { success: false, message: "unavailable" } },
        })
        renderHook(() => useQueryHeadhuntingCompanySuggestionsSwr("acme"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryHeadhuntingCompanySuggestions.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryHeadhuntingCompanySuggestionsSwr("acme"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("lets a transport failure through as a rejection rather than as no suggestions", async () => {
        mocks.queryHeadhuntingCompanySuggestions.mockRejectedValue(new Error("offline"))
        renderHook(() => useQueryHeadhuntingCompanySuggestionsSwr("acme"))
        await expect(fetcherOf()()).rejects.toThrow("offline")
    })
})
