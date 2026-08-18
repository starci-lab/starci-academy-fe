/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import {
    QUERY_PERSONAL_TASK_ATTEMPT_FEEDBACKS_SWR_KEY,
    useQueryPersonalTaskAttemptFeedbacksSwr,
} from "./useQueryPersonalTaskAttemptFeedbacksSwr"

/**
 * What these tests guard: the remarks come back in the author's own order rather than the server's
 * default, and an absent payload settles as `[]` - the panel renders "no feedback yet" for an empty
 * list, and a null would have to be handled a second way for the same meaning.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryPersonalTaskAttemptFeedbacks: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-course-personal-project", () => ({
    queryPersonalTaskAttemptFeedbacks: mocks.queryPersonalTaskAttemptFeedbacks,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** The remarks, two levels below the envelope. */
const feedbacks = [{ id: "feedback-1", sortIndex: 0, body: "Split the reducer" }]

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.useSWR.mockReset()
    mocks.queryPersonalTaskAttemptFeedbacks.mockReset()
    mocks.queryPersonalTaskAttemptFeedbacks.mockResolvedValue({
        data: {
            userPersonalTaskAttemptFeedbacks: {
                success: true, message: "ok", data: { data: feedbacks, total: 1 },
            },
        },
    })
})

describe("useQueryPersonalTaskAttemptFeedbacksSwr", () => {
    it("holds the key null until both the attempt and the viewer are known", () => {
        renderHook(() => useQueryPersonalTaskAttemptFeedbacksSwr())
        expect(keyOf()).toBeNull()

        setSessionToken(undefined)
        renderHook(() => useQueryPersonalTaskAttemptFeedbacksSwr("attempt-1"))
        expect(keyOf()).toBeNull()
    })

    it("names the viewer and the attempt in the key", () => {
        const hook = renderHook(() => useQueryPersonalTaskAttemptFeedbacksSwr("attempt-1"))
        const resting = keyOf()
        expect(resting).toEqual([
            QUERY_PERSONAL_TASK_ATTEMPT_FEEDBACKS_SWR_KEY, expect.any(String), "attempt-1",
        ])

        renderHook(() => useQueryPersonalTaskAttemptFeedbacksSwr("attempt-2"))
        expect(keyOf()).not.toEqual(resting)

        hook.rerender()
        act(() => setSessionToken("a-second-viewer"))
        expect(keyOf()).not.toEqual(resting)
    })

    it("asks for the remarks in the author's order and hands back the rows", async () => {
        renderHook(() => useQueryPersonalTaskAttemptFeedbacksSwr("attempt-1"))
        await expect(fetcherOf()()).resolves.toEqual(feedbacks)
        expect(mocks.queryPersonalTaskAttemptFeedbacks).toHaveBeenCalledWith({
            attemptId: "attempt-1",
            filters: { pageNumber: 0, limit: 100, sorts: [{ by: "sortIndex", order: "ASC" }] },
        })
    })

    it("settles an absent payload as an empty list", async () => {
        mocks.queryPersonalTaskAttemptFeedbacks.mockResolvedValue({
            data: { userPersonalTaskAttemptFeedbacks: { success: false, message: "denied" } },
        })
        renderHook(() => useQueryPersonalTaskAttemptFeedbacksSwr("attempt-1"))
        await expect(fetcherOf()()).resolves.toEqual([])
    })

    it("settles a missing response body as an empty list too", async () => {
        mocks.queryPersonalTaskAttemptFeedbacks.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryPersonalTaskAttemptFeedbacksSwr("attempt-1"))
        await expect(fetcherOf()()).resolves.toEqual([])
    })

    it("sends an empty attempt rather than the word undefined if it is ever run without one", async () => {
        renderHook(() => useQueryPersonalTaskAttemptFeedbacksSwr())
        await fetcherOf()()
        expect(mocks.queryPersonalTaskAttemptFeedbacks.mock.calls[0][0].attemptId).toBe("")
    })
})
