/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_ME_SWR_KEY, useQueryMeSwr } from "./useQueryMeSwr"

/**
 * What these tests guard: WHO the session belongs to. This is the one query where a stale cache
 * entry shows a reader somebody else's name, so the viewer-scoped key is the whole point - a
 * change of token must produce a fresh read, and a signed-out reader must make no request at all.
 */

const mocks = vi.hoisted(() => ({ queryMe: vi.fn() }))

vi.mock("@/modules/api/graphql/queries/query-me", () => ({
    queryMe: mocks.queryMe,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** The identity, trimmed to the fields the document selects. */
const me = { id: "user-1", email: "learner@example.com", displayName: "Mai" }

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { me: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.queryMe.mockReset()
    mocks.queryMe.mockResolvedValue(responseWith(me))
})

describe("QUERY_ME_SWR_KEY", () => {
    it("is a stable array key a caller can revalidate by name", () => {
        expect(QUERY_ME_SWR_KEY).toEqual(["QUERY_ME_SWR"])
    })
})

describe("useQueryMeSwr", () => {
    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryMeSwr(), { wrapper })
        expect(mocks.queryMe).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
        expect(result.current.isLoading).toBe(false)
    })

    it("hands back the identity, not the envelope", async () => {
        const { result } = renderHook(() => useQueryMeSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(me))
        expect(mocks.queryMe).toHaveBeenCalledTimes(1)
    })

    it("resolves to null when the session resolved to nobody", async () => {
        mocks.queryMe.mockResolvedValue({
            data: { me: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" } },
        })
        const { result } = renderHook(() => useQueryMeSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryMe.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryMeSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as nobody", async () => {
        mocks.queryMe.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryMeSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("never shows one viewer the identity fetched for another", async () => {
        const { result } = renderHook(() => useQueryMeSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(me))

        const other = { id: "user-2", email: "khoa@example.com", displayName: "Khoa" }
        mocks.queryMe.mockResolvedValue(responseWith(other))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual(other))
        expect(mocks.queryMe).toHaveBeenCalledTimes(2)
    })
})
