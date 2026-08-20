/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_SUGGESTED_USERS_SWR_KEY, useQuerySuggestedUsersSwr } from "./useQuerySuggestedUsersSwr"

/**
 * What these tests guard: follow suggestions are computed FROM who is asking, so serving them from
 * a key that does not mention the viewer would recommend the previous reader's people - including,
 * eventually, recommending a reader to follow themselves.
 */

const mocks = vi.hoisted(() => ({ querySuggestedUsers: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-suggested-users", () => ({
    querySuggestedUsers: mocks.querySuggestedUsers,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** One suggestion, trimmed to the fields the document selects. */
const rows = [{ userId: "user-1", displayName: "Mai", isFollowing: false }]

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { suggestedUsers: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.querySuggestedUsers.mockReset()
    mocks.querySuggestedUsers.mockResolvedValue(responseWith(rows))
})

describe("QUERY_SUGGESTED_USERS_SWR_KEY", () => {
    it("is a stable array key a follow change can revalidate by name", () => {
        expect(QUERY_SUGGESTED_USERS_SWR_KEY).toEqual(["QUERY_SUGGESTED_USERS_SWR"])
    })
})

describe("useQuerySuggestedUsersSwr", () => {
    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQuerySuggestedUsersSwr(), { wrapper })
        expect(mocks.querySuggestedUsers).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
    })

    it("hands back the suggestions, not the envelope", async () => {
        const { result } = renderHook(() => useQuerySuggestedUsersSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(rows))
        expect(mocks.querySuggestedUsers).toHaveBeenCalledTimes(1)
    })

    it("keeps an exhausted suggestion list as an empty array rather than as null", async () => {
        mocks.querySuggestedUsers.mockResolvedValue(responseWith([]))
        const { result } = renderHook(() => useQuerySuggestedUsersSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual([]))
        expect(result.current.data).not.toBeNull()
    })

    it("resolves to null when the server answered without a payload", async () => {
        mocks.querySuggestedUsers.mockResolvedValue({
            data: { suggestedUsers: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" } },
        })
        const { result } = renderHook(() => useQuerySuggestedUsersSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.querySuggestedUsers.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQuerySuggestedUsersSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as no suggestions", async () => {
        mocks.querySuggestedUsers.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQuerySuggestedUsersSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("reads again under a new key when the viewer changes", async () => {
        const { result } = renderHook(() => useQuerySuggestedUsersSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(rows))

        const other = [{ userId: "user-2", displayName: "Khoa", isFollowing: false }]
        mocks.querySuggestedUsers.mockResolvedValue(responseWith(other))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual(other))
        expect(mocks.querySuggestedUsers).toHaveBeenCalledTimes(2)
    })
})
