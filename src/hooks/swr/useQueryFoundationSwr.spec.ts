/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { QUERY_FOUNDATION_SWR_KEY, useQueryFoundationSwr } from "./useQueryFoundationSwr"

/**
 * What these tests guard: EITHER address opens a foundation - the primary key or the display id -
 * and the key carries both slots so the two ways of naming the same page do not collide with each
 * other or with a third foundation. A request naming neither reads nothing at all.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryFoundation: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-foundation", () => ({
    queryFoundation: mocks.queryFoundation,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** One foundation, trimmed to the fields the document selects. */
const foundation = { id: "foundation-1", displayId: "http", label: "HTTP" }

beforeEach(() => {
    mocks.useSWR.mockReset()
    mocks.queryFoundation.mockReset()
    mocks.queryFoundation.mockResolvedValue({
        data: { foundation: { success: true, message: "ok", data: foundation } },
    })
})

describe("useQueryFoundationSwr", () => {
    it("reads nothing when no address was given at all", () => {
        renderHook(() => useQueryFoundationSwr())
        expect(keyOf()).toBeNull()

        renderHook(() => useQueryFoundationSwr({}))
        expect(keyOf()).toBeNull()
    })

    it("keys by whichever address was used, and keeps the other slot empty", () => {
        renderHook(() => useQueryFoundationSwr({ id: "foundation-1" }))
        expect(keyOf()).toEqual([QUERY_FOUNDATION_SWR_KEY, "foundation-1", undefined])

        renderHook(() => useQueryFoundationSwr({ displayId: "http" }))
        expect(keyOf()).toEqual([QUERY_FOUNDATION_SWR_KEY, undefined, "http"])
    })

    it("passes the request through unchanged and hands back the foundation", async () => {
        renderHook(() => useQueryFoundationSwr({ displayId: "http" }))
        await expect(fetcherOf()()).resolves.toEqual(foundation)
        expect(mocks.queryFoundation).toHaveBeenCalledWith({ request: { displayId: "http" } })
    })

    it("resolves to null for an address the server does not know", async () => {
        mocks.queryFoundation.mockResolvedValue({
            data: { foundation: { success: false, message: "not found" } },
        })
        renderHook(() => useQueryFoundationSwr({ displayId: "nope" }))
        await expect(fetcherOf()()).resolves.toBeNull()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryFoundation.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryFoundationSwr({ displayId: "http" }))
        await expect(fetcherOf()()).resolves.toBeNull()
    })
})
