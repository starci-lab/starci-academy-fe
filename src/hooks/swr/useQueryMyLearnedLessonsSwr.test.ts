/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type PropsWithChildren } from "react"
import { SWRConfig } from "swr"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import { QUERY_MY_LEARNED_LESSONS_SWR_KEY, useQueryMyLearnedLessonsSwr } from "./useQueryMyLearnedLessonsSwr"

/**
 * What these tests guard: this list is MERGED with its sibling by the caller, so an absent payload
 * has to arrive as `[]` and never as `null` - a merge is the wrong place to be asking whether a
 * list exists. The viewer scope is the other half: a resume rail must not offer the previous
 * reader's lessons.
 */

const mocks = vi.hoisted(() => ({ queryMyLearnedLessons: vi.fn() }))

vi.mock("../../modules/api/graphql/queries/query-my-learned-lessons", () => ({
    queryMyLearnedLessons: mocks.queryMyLearnedLessons,
}))

/** A fresh SWR cache per render, so one test cannot serve another test's answer. */
const wrapper = ({ children }: PropsWithChildren) => createElement(
    SWRConfig,
    { value: { provider: () => new Map(), dedupingInterval: 0 } },
    children,
)

/** One row, trimmed to the fields the document selects. */
const rows = [{ refId: "lesson-1", label: "Consistent hashing" }]

/** Wrap a payload in the envelope the transport returns. */
const responseWith = (data: unknown) => ({
    data: { myLearnedLessons: { success: true, message: "ok", data } },
})

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.queryMyLearnedLessons.mockReset()
    mocks.queryMyLearnedLessons.mockResolvedValue(responseWith(rows))
})

describe("QUERY_MY_LEARNED_LESSONS_SWR_KEY", () => {
    it("is a stable array key whatever records progress can name", () => {
        expect(QUERY_MY_LEARNED_LESSONS_SWR_KEY).toEqual(["QUERY_MY_LEARNED_LESSONS_SWR"])
    })
})

describe("useQueryMyLearnedLessonsSwr", () => {
    it("asks for nothing at all while nobody is signed in", () => {
        setSessionToken(undefined)
        const { result } = renderHook(() => useQueryMyLearnedLessonsSwr(), { wrapper })
        expect(mocks.queryMyLearnedLessons).not.toHaveBeenCalled()
        expect(result.current.isLoading).toBe(false)
    })

    it("hands back the rows, not the envelope", async () => {
        const { result } = renderHook(() => useQueryMyLearnedLessonsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(rows))
        expect(mocks.queryMyLearnedLessons).toHaveBeenCalledTimes(1)
    })

    it("makes an absent payload an empty array, because the caller merges this list", async () => {
        mocks.queryMyLearnedLessons.mockResolvedValue({
            data: { myLearnedLessons: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" } },
        })
        const { result } = renderHook(() => useQueryMyLearnedLessonsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual([]))
        expect(result.current.data).not.toBeNull()
    })

    it("makes a missing response body an empty array too", async () => {
        mocks.queryMyLearnedLessons.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useQueryMyLearnedLessonsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual([]))
    })

    it("surfaces a transport failure as an error rather than as an empty list", async () => {
        mocks.queryMyLearnedLessons.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useQueryMyLearnedLessonsSwr(), { wrapper })
        await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
        expect(result.current.data).toBeUndefined()
    })

    it("reads again under a new key when the viewer changes", async () => {
        const { result } = renderHook(() => useQueryMyLearnedLessonsSwr(), { wrapper })
        await waitFor(() => expect(result.current.data).toEqual(rows))

        mocks.queryMyLearnedLessons.mockResolvedValue(responseWith([]))
        act(() => setSessionToken("a-second-viewer"))

        await waitFor(() => expect(result.current.data).toEqual([]))
        expect(mocks.queryMyLearnedLessons).toHaveBeenCalledTimes(2)
    })
})
