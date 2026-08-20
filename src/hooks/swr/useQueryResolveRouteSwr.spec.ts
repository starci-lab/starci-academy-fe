/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { QUERY_RESOLVE_ROUTE_SWR_KEY, useQueryResolveRouteSwr } from "./useQueryResolveRouteSwr"

/**
 * What these tests guard: this reads on DEMAND and never on mount. Resolving an opaque id is what
 * a press does on the way to a route, so a hook that fetched while merely rendered would resolve
 * every id on a page the moment it appeared.
 *
 * The request is ONE OPAQUE ID and nothing else, which is the index's whole contract: a caller
 * holding a reference row knows its `globalId` and not which course or module it belongs to.
 */

const mocks = vi.hoisted(() => ({ queryResolveRoute: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-resolve-route", () => ({
    queryResolveRoute: mocks.queryResolveRoute,
}))

/** What the transport answers with for a resolvable id. */
const resolved = {
    data: { resolveRoute: { success: true, message: "ok", data: { path: "/courses/systems-design" } } },
}

beforeEach(() => {
    mocks.queryResolveRoute.mockReset()
    mocks.queryResolveRoute.mockResolvedValue(resolved)
})

describe("QUERY_RESOLVE_ROUTE_SWR_KEY", () => {
    it("is one stable on-demand key", () => {
        expect(QUERY_RESOLVE_ROUTE_SWR_KEY).toBe("QUERY_RESOLVE_ROUTE_SWR")
    })
})

describe("useQueryResolveRouteSwr", () => {
    it("resolves nothing until a caller triggers navigation", () => {
        const { result } = renderHook(() => useQueryResolveRouteSwr())
        expect(mocks.queryResolveRoute).not.toHaveBeenCalled()
        expect(result.current.isMutating).toBe(false)
        expect(result.current.data).toBeUndefined()
    })

    it("passes the trigger argument through as the request and hands back the response", async () => {
        const { result } = renderHook(() => useQueryResolveRouteSwr())

        const request = { globalId: "44ab" }
        await act(async () => {
            await expect(result.current.trigger(request)).resolves.toEqual(resolved)
        })
        expect(mocks.queryResolveRoute).toHaveBeenCalledWith({ request })
        expect(Object.keys(request)).toEqual(["globalId"])
    })

    it("reports a transport failure as an error rather than as a resolved route", async () => {
        mocks.queryResolveRoute.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryResolveRouteSwr())

        await act(async () => {
            await expect(result.current.trigger({ globalId: "44ab" })).rejects.toThrow("offline")
        })
        expect(result.current.data).toBeUndefined()
    })
})
