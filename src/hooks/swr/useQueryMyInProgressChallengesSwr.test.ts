/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import {
    QUERY_MY_IN_PROGRESS_CHALLENGES_SWR_KEY,
    useQueryMyInProgressChallengesSwr,
} from "./useQueryMyInProgressChallengesSwr"

/**
 * What these tests guard: an absent payload has to arrive as `[]`, because the caller merges this
 * list with the lessons list and a merge should not have to ask whether either side exists. And
 * passing a challenge REMOVES it from here, so the viewer must be in the key or a reader is
 * offered a challenge somebody else has already finished.
 */

const mocks = vi.hoisted(() => ({ queryMyInProgressChallenges: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-my-in-progress-challenges", () => ({
    queryMyInProgressChallenges: mocks.queryMyInProgressChallenges,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** One row, trimmed to the fields the document selects. */
const rows = [{ refId: "challenge-1", label: "Rate limiter" }]

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { myInProgressChallenges: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.queryMyInProgressChallenges.mockReset()
    mocks.queryMyInProgressChallenges.mockResolvedValue(responseWith(rows))
})

describe("QUERY_MY_IN_PROGRESS_CHALLENGES_SWR_KEY", () => {
    it("is a stable array key a pass can revalidate by name", () => {
        expect(QUERY_MY_IN_PROGRESS_CHALLENGES_SWR_KEY).toEqual(["QUERY_MY_IN_PROGRESS_CHALLENGES_SWR"])
    })
})

describe("useQueryMyInProgressChallengesSwr", () => {
    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryMyInProgressChallengesSwr(), { wrapper })
        expect(mocks.queryMyInProgressChallenges).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
    })

    it("hands back the rows, not the envelope", async () => {
        const { result } = renderHook(() => useQueryMyInProgressChallengesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(rows))
        expect(mocks.queryMyInProgressChallenges).toHaveBeenCalledTimes(1)
    })

    it("makes an absent payload an empty array, because the caller merges this list", async () => {
        mocks.queryMyInProgressChallenges.mockResolvedValue({
            data: { myInProgressChallenges: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" } },
        })
        const { result } = renderHook(() => useQueryMyInProgressChallengesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual([]))
        expect(result.current.data).not.toBeNull()
    })

    it("makes a missing response body an empty array too", async () => {
        mocks.queryMyInProgressChallenges.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryMyInProgressChallengesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual([]))
    })

    it("surfaces a transport failure as an error rather than as an empty list", async () => {
        mocks.queryMyInProgressChallenges.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryMyInProgressChallengesSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("reads again under a new key when the viewer changes", async () => {
        const { result } = renderHook(() => useQueryMyInProgressChallengesSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(rows))

        mocks.queryMyInProgressChallenges.mockResolvedValue(responseWith([]))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual([]))
        expect(mocks.queryMyInProgressChallenges).toHaveBeenCalledTimes(2)
    })
})
