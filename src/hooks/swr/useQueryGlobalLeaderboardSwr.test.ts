/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_GLOBAL_LEADERBOARD_SWR_KEY, useQueryGlobalLeaderboardSwr } from "./useQueryGlobalLeaderboardSwr"

/**
 * What these tests guard: the board carries the asking viewer's own standing and their follow
 * truth for every row, so it is not a public answer and the key must name the viewer. Serving it
 * from a shared entry would highlight the previous reader as "you".
 */

const mocks = vi.hoisted(() => ({ queryGlobalLeaderboard: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-global-leaderboard", () => ({
    queryGlobalLeaderboard: mocks.queryGlobalLeaderboard,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** A board, trimmed to the fields the document selects. */
const board = {
    rows: [{ userId: "user-1", rank: 1, xp: 900, isFollowing: false }],
    viewerRank: 12,
}

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { globalLeaderboard: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.queryGlobalLeaderboard.mockReset()
    mocks.queryGlobalLeaderboard.mockResolvedValue(responseWith(board))
})

describe("QUERY_GLOBAL_LEADERBOARD_SWR_KEY", () => {
    it("is a stable array key a follow change can revalidate by name", () => {
        expect(QUERY_GLOBAL_LEADERBOARD_SWR_KEY).toEqual(["QUERY_GLOBAL_LEADERBOARD_SWR"])
    })
})

describe("useQueryGlobalLeaderboardSwr", () => {
    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryGlobalLeaderboardSwr(), { wrapper })
        expect(mocks.queryGlobalLeaderboard).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
    })

    it("hands back the board with its follow truth, not the envelope", async () => {
        const { result } = renderHook(() => useQueryGlobalLeaderboardSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(board))
        expect(mocks.queryGlobalLeaderboard).toHaveBeenCalledTimes(1)
    })

    it("resolves to null when the server answered without a payload", async () => {
        mocks.queryGlobalLeaderboard.mockResolvedValue({
            data: { globalLeaderboard: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" } },
        })
        const { result } = renderHook(() => useQueryGlobalLeaderboardSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryGlobalLeaderboard.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryGlobalLeaderboardSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as an empty board", async () => {
        mocks.queryGlobalLeaderboard.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryGlobalLeaderboardSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("never leaves one viewer's standing on screen for the next", async () => {
        const { result } = renderHook(() => useQueryGlobalLeaderboardSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(board))

        const other = { rows: [], viewerRank: null }
        mocks.queryGlobalLeaderboard.mockResolvedValue(responseWith(other))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual(other))
        expect(mocks.queryGlobalLeaderboard).toHaveBeenCalledTimes(2)
    })
})
