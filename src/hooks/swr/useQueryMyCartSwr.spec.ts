/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_MY_CART_SWR_KEY, useQueryMyCartSwr } from "./useQueryMyCartSwr"

/**
 * What these tests guard: the EMPTY-versus-ABSENT distinction and the viewer scope. An empty
 * basket and a basket that has not arrived draw completely differently, so `[]` and `null` must
 * stay apart from `undefined`. And the key carries the viewer, because a cart read out of the
 * previous viewer's cache is a checkout for somebody else's courses.
 */

const mocks = vi.hoisted(() => ({ queryMyCart: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-my-cart", () => ({
    QueryMyCart: { Query1: "query1" },
    queryMyCart: mocks.queryMyCart,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** One line, trimmed to the fields the document selects. */
const rows = [{ courseId: "course-1", label: "Systems Design", price: 490000 }]

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { myCart: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.queryMyCart.mockReset()
    mocks.queryMyCart.mockResolvedValue(responseWith(rows))
})

describe("QUERY_MY_CART_SWR_KEY", () => {
    it("is a stable array key, so an add or a removal can name it", () => {
        expect(QUERY_MY_CART_SWR_KEY).toEqual(["QUERY_MY_CART_SWR"])
    })
})

describe("useQueryMyCartSwr", () => {
    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryMyCartSwr(), { wrapper })
        expect(mocks.queryMyCart).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
    })

    it("hands back the lines, not the envelope, and selects the one document variant", async () => {
        const { result } = renderHook(() => useQueryMyCartSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(rows))
        expect(mocks.queryMyCart).toHaveBeenCalledWith({ query: "query1" })
    })

    it("keeps an empty basket as an empty array rather than as null", async () => {
        mocks.queryMyCart.mockResolvedValue(responseWith([]))
        const { result } = renderHook(() => useQueryMyCartSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual([]))
        expect(result.current.data).not.toBeNull()
    })

    it("resolves to null when the server answered without a payload", async () => {
        mocks.queryMyCart.mockResolvedValue({
            data: { myCart: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" } },
        })
        const { result } = renderHook(() => useQueryMyCartSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryMyCart.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryMyCartSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as an empty basket", async () => {
        mocks.queryMyCart.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryMyCartSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("reads again under a new key when the viewer changes", async () => {
        const { result } = renderHook(() => useQueryMyCartSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(rows))

        mocks.queryMyCart.mockResolvedValue(responseWith([]))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual([]))
        expect(mocks.queryMyCart).toHaveBeenCalledTimes(2)
    })
})
