/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { useQueryConsultantsSwr } from "./useQueryConsultantsSwr"

/**
 * What these tests guard: the SEARCH is part of the key and part of the request only when there is
 * one. An empty search must not travel as `search: ""` - the server reads that as a filter nothing
 * matches - so the absence is the point, and it is checked at the wire.
 *
 * SWR is replaced so the fetcher's own refusal is reachable: the key is null whenever the company
 * is unknown, and a guard nobody can reach is a guard nobody notices breaking.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryConsultants: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-consultants", () => ({
    queryConsultants: mocks.queryConsultants,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One page of consultants, trimmed to the fields the document selects. */
const page = { data: [{ id: "consultant-1", displayName: "Mai" }], total: 1 }

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.useSWR.mockReset()
    mocks.queryConsultants.mockReset()
    mocks.queryConsultants.mockResolvedValue({
        data: { consultants: { success: true, message: "ok", data: page } },
    })
})

describe("useQueryConsultantsSwr", () => {
    it("holds the key null until both the company and the viewer are known", () => {
        renderHook(() => useQueryConsultantsSwr())
        expect(keyOf()).toBeNull()

        setSessionToken(undefined)
        renderHook(() => useQueryConsultantsSwr("company-1"))
        expect(keyOf()).toBeNull()
    })

    it("names the company, the search and the viewer in the key", () => {
        const hook = renderHook(() => useQueryConsultantsSwr("company-1"))
        const resting = keyOf()
        expect(resting).toEqual(["QUERY_CONSULTANTS_SWR", "company-1", "", expect.any(String)])

        renderHook(() => useQueryConsultantsSwr("company-1", "mai"))
        expect(keyOf()).not.toEqual(resting)

        hook.rerender()
        act(() => setSessionToken("a-second-viewer"))
        expect(keyOf()).not.toEqual(resting)
    })

    it("sends no search filter at all when nothing was typed", async () => {
        renderHook(() => useQueryConsultantsSwr("company-1"))
        await expect(fetcherOf()()).resolves.toEqual(page)

        const sent = mocks.queryConsultants.mock.calls[0][0].request
        expect(sent.companyId).toBe("company-1")
        expect(sent.filters).not.toHaveProperty("search")
        expect(sent.filters.sorts).toEqual([{ by: "sortIndex", order: "ASC" }])
    })

    it("sends the search when there is one", async () => {
        renderHook(() => useQueryConsultantsSwr("company-1", "mai"))
        await fetcherOf()()
        expect(mocks.queryConsultants.mock.calls[0][0].request.filters.search).toBe("mai")
    })

    it("resolves to null when the server answered without a page", async () => {
        mocks.queryConsultants.mockResolvedValue({
            data: { consultants: { success: false, message: "not found", error: "NOT_FOUND" } },
        })
        renderHook(() => useQueryConsultantsSwr("company-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryConsultants.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryConsultantsSwr("company-1"))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("refuses to list consultants for no company", async () => {
        renderHook(() => useQueryConsultantsSwr(undefined))
        await expect(fetcherOf()()).rejects.toThrow("Company id not found")
        expect(mocks.queryConsultants).not.toHaveBeenCalled()
    })
})
