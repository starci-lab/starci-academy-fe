/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useQueryHeadhuntingCompanySwr } from "./useQueryHeadhuntingCompanySwr"

/**
 * What these tests guard: one company is one cache entry, and no company is no request. SWR is
 * replaced so the fetcher's own refusal is reachable - the key is null whenever the company is
 * unknown, and a guard nobody can reach is a guard nobody notices breaking.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryHeadhuntingCompany: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-headhunting-company", () => ({
    queryHeadhuntingCompany: mocks.queryHeadhuntingCompany,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One company, trimmed to the fields the document selects. */
const company = { id: "company-1", name: "Starci Labs" }

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryHeadhuntingCompany.mockReset()
    mocks.queryHeadhuntingCompany.mockResolvedValue({
        data: { headhuntingCompany: { success: true, message: "ok", data: company } },
    })
})

describe("useQueryHeadhuntingCompanySwr", () => {
    it("holds the key null until a company is named", () => {
        renderHook(() => useQueryHeadhuntingCompanySwr())
        expect(keyOf()).toBeNull()
    })

    it("gives each company its own cache entry", () => {
        renderHook(() => useQueryHeadhuntingCompanySwr("company-1"))
        const first = keyOf()
        expect(first).toEqual(["QUERY_HEADHUNTING_COMPANY_SWR", "company-1"])

        renderHook(() => useQueryHeadhuntingCompanySwr("company-2"))
        expect(keyOf()).not.toEqual(first)
    })

    it("hands back the company, not the envelope", async () => {
        renderHook(() => useQueryHeadhuntingCompanySwr("company-1"))
        await expect(fetcherOf()()).resolves.toEqual(company)
        expect(mocks.queryHeadhuntingCompany).toHaveBeenCalledWith({ request: { id: "company-1" } })
    })

    it("resolves to null for a company the server does not know", async () => {
        mocks.queryHeadhuntingCompany.mockResolvedValue({
            data: { headhuntingCompany: { success: false, message: "not found", error: "NOT_FOUND" } },
        })
        renderHook(() => useQueryHeadhuntingCompanySwr("company-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryHeadhuntingCompany.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryHeadhuntingCompanySwr("company-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("refuses to read a company that was never named", async () => {
        renderHook(() => useQueryHeadhuntingCompanySwr(undefined))
        await expect(fetcherOf()()).rejects.toThrow("Company id not found")
        expect(mocks.queryHeadhuntingCompany).not.toHaveBeenCalled()
    })
})
