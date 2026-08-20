/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { setSessionToken } from "../auth/useSessionToken"
import {
    QUERY_PERSONAL_TASK_ATTEMPTS_SWR_KEY,
    useQueryPersonalTaskAttemptsSwr,
} from "./useQueryPersonalTaskAttemptsSwr"

/**
 * What these tests guard: attempts arrive NEWEST FIRST, because the panel shows the latest grading
 * and offers the history below it; and an absent payload settles as `[]`, because the caller counts
 * the entries to decide how many attempts are left.
 */

const mocks = vi.hoisted(() => ({ useSWR: vi.fn(), queryPersonalTaskAttempts: vi.fn() }))

vi.mock("swr", () => ({ default: mocks.useSWR }))
vi.mock("@/modules/api/graphql/queries/query-course-personal-project", () => ({
    queryPersonalTaskAttempts: mocks.queryPersonalTaskAttempts,
}))

/** The key the hook asked SWR for on its last render. */
const keyOf = (): unknown => mocks.useSWR.mock.calls.at(-1)?.[0]

/** The fetcher the hook handed SWR on its last render. */
const fetcherOf = (): (() => Promise<unknown>) => mocks.useSWR.mock.calls.at(-1)?.[1]

/** The attempts, two levels below the envelope. */
const attempts = [{ id: "attempt-2", attemptNumber: 2 }, { id: "attempt-1", attemptNumber: 1 }]

beforeEach(() => {
    setSessionToken("token-under-test")
    mocks.useSWR.mockReset()
    mocks.queryPersonalTaskAttempts.mockReset()
    mocks.queryPersonalTaskAttempts.mockResolvedValue({
        data: {
            userPersonalTaskAttempts: {
                success: true, message: "ok", data: { data: attempts, count: 2 },
            },
        },
    })
})

describe("useQueryPersonalTaskAttemptsSwr", () => {
    it("holds the key null until the course, the task and the viewer are all known", () => {
        renderHook(() => useQueryPersonalTaskAttemptsSwr())
        expect(keyOf()).toBeNull()

        renderHook(() => useQueryPersonalTaskAttemptsSwr("course-1"))
        expect(keyOf()).toBeNull()

        setSessionToken(undefined)
        renderHook(() => useQueryPersonalTaskAttemptsSwr("course-1", "task-1"))
        expect(keyOf()).toBeNull()
    })

    it("names the viewer, the course and the task in the key", () => {
        const hook = renderHook(() => useQueryPersonalTaskAttemptsSwr("course-1", "task-1"))
        const resting = keyOf()
        expect(resting).toEqual([
            QUERY_PERSONAL_TASK_ATTEMPTS_SWR_KEY, expect.any(String), "course-1", "task-1", 0,
        ])

        renderHook(() => useQueryPersonalTaskAttemptsSwr("course-1", "task-2"))
        expect(keyOf()).not.toEqual(resting)

        hook.rerender()
        act(() => setSessionToken("a-second-viewer"))
        expect(keyOf()).not.toEqual(resting)
    })

    it("asks newest attempt first and preserves count with the rows", async () => {
        renderHook(() => useQueryPersonalTaskAttemptsSwr("course-1", "task-1"))
        await expect(fetcherOf()()).resolves.toEqual({ data: attempts, count: 2 })
        expect(mocks.queryPersonalTaskAttempts).toHaveBeenCalledWith({
            courseId: "course-1",
            taskId: "task-1",
            filters: { pageNumber: 0, limit: 20, sorts: [{ by: "attemptNumber", order: "DESC" }] },
        })
    })

    it("names and requests the selected history page", async () => {
        renderHook(() => useQueryPersonalTaskAttemptsSwr("course-1", "task-1", 1))
        expect(keyOf()).toEqual([
            QUERY_PERSONAL_TASK_ATTEMPTS_SWR_KEY, expect.any(String), "course-1", "task-1", 1,
        ])
        await fetcherOf()()
        expect(mocks.queryPersonalTaskAttempts.mock.calls[0][0].filters.pageNumber).toBe(1)
    })

    it("settles an absent payload as an empty list, because the caller counts the entries", async () => {
        mocks.queryPersonalTaskAttempts.mockResolvedValue({
            data: { userPersonalTaskAttempts: { success: false, message: "denied" } },
        })
        renderHook(() => useQueryPersonalTaskAttemptsSwr("course-1", "task-1"))
        await expect(fetcherOf()()).resolves.toEqual({ count: 0, data: [] })
    })

    it("settles a missing response body as an empty list too", async () => {
        mocks.queryPersonalTaskAttempts.mockResolvedValue({ data: undefined })
        renderHook(() => useQueryPersonalTaskAttemptsSwr("course-1", "task-1"))
        await expect(fetcherOf()()).resolves.toEqual({ count: 0, data: [] })
    })

    it("sends empty ids rather than the word undefined if it is ever run without them", async () => {
        renderHook(() => useQueryPersonalTaskAttemptsSwr())
        await fetcherOf()()
        const sent = mocks.queryPersonalTaskAttempts.mock.calls[0][0]
        expect(sent.courseId).toBe("")
        expect(sent.taskId).toBe("")
    })
})
