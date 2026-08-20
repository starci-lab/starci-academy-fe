/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_WEEKLY_CHALLENGE_SWR_KEY, useQueryWeeklyChallengeSwr } from "./useQueryWeeklyChallengeSwr"

/**
 * What these tests guard: the featured challenge travels WITH the asking viewer's pass and claim
 * state, so the key has to carry the viewer - otherwise the next reader on the tab is told they
 * have already claimed a reward they have never seen.
 */

const mocks = vi.hoisted(() => ({ queryWeeklyChallenge: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-weekly-challenge", () => ({
    queryWeeklyChallenge: mocks.queryWeeklyChallenge,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** The featured challenge, trimmed to the fields the document selects. */
const challenge = { challengeId: "challenge-1", label: "Design a rate limiter", hasPassed: false, hasClaimed: false }

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { weeklyChallenge: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.queryWeeklyChallenge.mockReset()
    mocks.queryWeeklyChallenge.mockResolvedValue(responseWith(challenge))
})

describe("QUERY_WEEKLY_CHALLENGE_SWR_KEY", () => {
    it("is a stable array key a claim can revalidate by name", () => {
        expect(QUERY_WEEKLY_CHALLENGE_SWR_KEY).toEqual(["QUERY_WEEKLY_CHALLENGE_SWR"])
    })
})

describe("useQueryWeeklyChallengeSwr", () => {
    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryWeeklyChallengeSwr(), { wrapper })
        expect(mocks.queryWeeklyChallenge).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
    })

    it("hands back the challenge with its viewer state, not the envelope", async () => {
        const { result } = renderHook(() => useQueryWeeklyChallengeSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(challenge))
        expect(mocks.queryWeeklyChallenge).toHaveBeenCalledTimes(1)
    })

    it("resolves to null when no challenge is featured", async () => {
        mocks.queryWeeklyChallenge.mockResolvedValue({
            data: { weeklyChallenge: { success: false, message: "none", error: "NOT_FOUND" } },
        })
        const { result } = renderHook(() => useQueryWeeklyChallengeSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryWeeklyChallenge.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryWeeklyChallengeSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as no challenge", async () => {
        mocks.queryWeeklyChallenge.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryWeeklyChallengeSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("does not carry one viewer's claim state over to the next", async () => {
        const { result } = renderHook(() => useQueryWeeklyChallengeSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(challenge))

        const claimed = { ...challenge, hasPassed: true, hasClaimed: true }
        mocks.queryWeeklyChallenge.mockResolvedValue(responseWith(claimed))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual(claimed))
        expect(mocks.queryWeeklyChallenge).toHaveBeenCalledTimes(2)
    })
})
