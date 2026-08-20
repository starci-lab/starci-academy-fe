/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useQueryHeadhuntingCompaniesSwr } from "./useQueryHeadhuntingCompaniesSwr"

/**
 * What these tests guard: the whole list reads under one key with no arguments, and an absent
 * payload arrives as `null` rather than as an empty list - "we could not read the companies" and
 * "there are no companies" draw differently, and only the first is worth a retry.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryHeadhuntingCompanies: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-headhunting-companies", () => ({
    queryHeadhuntingCompanies: mocks.queryHeadhuntingCompanies,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One company, trimmed to the fields the document selects. */
const rows = [{ id: "company-1", name: "Starci Labs" }]

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryHeadhuntingCompanies.mockReset()
    mocks.queryHeadhuntingCompanies.mockResolvedValue({
        data: { headhuntingCompanies: { success: true, message: "ok", data: rows } },
    })
})

describe("useQueryHeadhuntingCompaniesSwr", () => {
    it("reads under one shared key", () => {
        renderHook(() => useQueryHeadhuntingCompaniesSwr())
        expect(keyOf()).toBe("QUERY_HEADHUNTING_COMPANIES_SWR")
    })

    it("hands back the companies, not the envelope", async () => {
        renderHook(() => useQueryHeadhuntingCompaniesSwr())
        await expect(fetcherOf()()).resolves.toEqual(rows)
    })

    it("keeps a genuinely empty list apart from an unreadable one", async () => {
        mocks.queryHeadhuntingCompanies.mockResolvedValue({
            data: { headhuntingCompanies: { success: true, message: "ok", data: [] } },
        })
        renderHook(() => useQueryHeadhuntingCompaniesSwr())
        await expect(fetcherOf()()).resolves.toEqual([])

        mocks.queryHeadhuntingCompanies.mockResolvedValue({
            data: { headhuntingCompanies: { success: false, message: "unavailable" } },
        })
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryHeadhuntingCompanies.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryHeadhuntingCompaniesSwr())
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("lets a transport failure through as a rejection rather than as no companies", async () => {
        mocks.queryHeadhuntingCompanies.mockRejectedValue(new Error("offline"))
        renderHook(() => useQueryHeadhuntingCompaniesSwr())
        await expect(fetcherOf()()).rejects.toThrow("offline")
    })
})
