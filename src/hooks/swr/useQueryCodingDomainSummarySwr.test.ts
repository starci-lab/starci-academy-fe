/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    QUERY_CODING_DOMAIN_SUMMARY_SWR_KEY,
    useQueryCodingDomainSummarySwr,
} from "./useQueryCodingDomainSummarySwr"

/**
 * What these tests guard: the summary is the same for everybody, so the key is one plain string
 * with no viewer in it, and it reads for a signed-out visitor. The unwrapping keeps `null` distinct
 * from `undefined` - "no domains published" is an answer, and SWR already owns `undefined`.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryCodingDomainSummary: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("../../modules/api/graphql/queries/query-coding-domain-summary", () => ({
    queryCodingDomainSummary: mocks.queryCodingDomainSummary,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** The summary, trimmed to the fields the document selects. */
const summary = { domains: [{ slug: "arrays", solved: 4, total: 20 }] }

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryCodingDomainSummary.mockReset()
    mocks.queryCodingDomainSummary.mockResolvedValue({
        data: { codingDomainSummary: { success: true, message: "ok", data: summary } },
    })
})

describe("useQueryCodingDomainSummarySwr", () => {
    it("reads under one shared key, because the answer is not personal", () => {
        renderHook(() => useQueryCodingDomainSummarySwr())
        expect(keyOf()).toBe(QUERY_CODING_DOMAIN_SUMMARY_SWR_KEY)
    })

    it("hands back the summary, not the envelope", async () => {
        renderHook(() => useQueryCodingDomainSummarySwr())
        await expect(fetcherOf()()).resolves.toEqual(summary)
        expect(mocks.queryCodingDomainSummary).toHaveBeenCalledTimes(1)
    })

    it("resolves to null when the server answered without a summary", async () => {
        mocks.queryCodingDomainSummary.mockResolvedValue({
            data: { codingDomainSummary: { success: false, message: "unavailable" } },
        })
        renderHook(() => useQueryCodingDomainSummarySwr())
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryCodingDomainSummary.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryCodingDomainSummarySwr())
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("lets a transport failure through as a rejection rather than as an empty summary", async () => {
        mocks.queryCodingDomainSummary.mockRejectedValue(new Error("offline"))
        renderHook(() => useQueryCodingDomainSummarySwr())
        await expect(fetcherOf()()).rejects.toThrow("offline")
    })
})
