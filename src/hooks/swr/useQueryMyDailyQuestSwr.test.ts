/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_MY_DAILY_QUEST_SWR_KEY, useQueryMyDailyQuestSwr } from "./useQueryMyDailyQuestSwr"

/**
 * What these tests guard: "there is no quest for you today" must stay distinguishable from "the
 * quest is on its way", and the answer must belong to the viewer who asked - a quest still
 * offering a reward the previous reader collected is the most confusing kind of stale.
 */

const mocks = vi.hoisted(() => ({ queryMyDailyQuest: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-my-daily-quest", () => ({
    queryMyDailyQuest: mocks.queryMyDailyQuest,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** Today's quest, trimmed to the fields the document selects. */
const quest = { questId: "quest-1", label: "Finish one lesson", rewardPoints: 50, isClaimed: false }

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { myDailyQuest: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.queryMyDailyQuest.mockReset()
    mocks.queryMyDailyQuest.mockResolvedValue(responseWith(quest))
})

describe("QUERY_MY_DAILY_QUEST_SWR_KEY", () => {
    it("is a stable array key, so whatever collects the reward can name it", () => {
        expect(QUERY_MY_DAILY_QUEST_SWR_KEY).toEqual(["QUERY_MY_DAILY_QUEST_SWR"])
    })
})

describe("useQueryMyDailyQuestSwr", () => {
    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryMyDailyQuestSwr(), { wrapper })
        expect(mocks.queryMyDailyQuest).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
    })

    it("hands back the quest, not the envelope", async () => {
        const { result } = renderHook(() => useQueryMyDailyQuestSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(quest))
        expect(mocks.queryMyDailyQuest).toHaveBeenCalledTimes(1)
    })

    it("resolves to null when there is no quest today", async () => {
        mocks.queryMyDailyQuest.mockResolvedValue({
            data: { myDailyQuest: { success: false, message: "no quest", error: "NOT_FOUND" } },
        })
        const { result } = renderHook(() => useQueryMyDailyQuestSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
        expect(result.current.error).toBeUndefined()
    })

    it("resolves to null when there is no response body at all", async () => {
        mocks.queryMyDailyQuest.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryMyDailyQuestSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toBeNull())
    })

    it("surfaces a transport failure as an error rather than as no quest", async () => {
        mocks.queryMyDailyQuest.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryMyDailyQuestSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("reads again under a new key when the viewer changes", async () => {
        const { result } = renderHook(() => useQueryMyDailyQuestSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(quest))

        const claimed = { ...quest, isClaimed: true }
        mocks.queryMyDailyQuest.mockResolvedValue(responseWith(claimed))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual(claimed))
        expect(mocks.queryMyDailyQuest).toHaveBeenCalledTimes(2)
    })
})
