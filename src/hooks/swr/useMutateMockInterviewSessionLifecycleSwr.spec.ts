/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    MUTATE_ABANDON_MOCK_INTERVIEW_SESSION_SWR_KEY,
    MUTATE_COMPLETE_MOCK_INTERVIEW_SESSION_SWR_KEY,
    MUTATE_RETRY_MOCK_INTERVIEW_GRADING_SWR_KEY,
    useMutateAbandonMockInterviewSessionSwr,
    useMutateCompleteMockInterviewSessionSwr,
    useMutateRetryMockInterviewSessionGradingSwr,
} from "./useMutateMockInterviewSessionLifecycleSwr"

const mocks = vi.hoisted(() => ({
    complete: vi.fn(),
    abandon: vi.fn(),
    retry: vi.fn(),
}))

vi.mock("@/modules/api/graphql/mutations/mutation-mock-interview-session-lifecycle", () => ({
    mutationCompleteMockInterviewSession: mocks.complete,
    mutationAbandonMockInterviewSession: mocks.abandon,
    mutationRetryMockInterviewSessionGrading: mocks.retry,
}))

beforeEach(() => {
    vi.clearAllMocks()
    mocks.complete.mockResolvedValue({ data: {} })
    mocks.abandon.mockResolvedValue({ data: {} })
    mocks.retry.mockResolvedValue({ data: {} })
})

describe("mock interview lifecycle SWR mutations", () => {
    it("keeps one stable cache family per command", () => {
        expect(MUTATE_COMPLETE_MOCK_INTERVIEW_SESSION_SWR_KEY).toBe("MUTATE_COMPLETE_MOCK_INTERVIEW_SESSION_SWR")
        expect(MUTATE_ABANDON_MOCK_INTERVIEW_SESSION_SWR_KEY).toBe("MUTATE_ABANDON_MOCK_INTERVIEW_SESSION_SWR")
        expect(MUTATE_RETRY_MOCK_INTERVIEW_GRADING_SWR_KEY).toBe("MUTATE_RETRY_MOCK_INTERVIEW_GRADING_SWR")
    })

    it("forwards course identity through the authenticated header", async () => {
        const request = { courseId: "course-1", sessionId: "session-1", expectedRevision: 2 }
        const complete = renderHook(() => useMutateCompleteMockInterviewSessionSwr("course-1", "session-1"))
        const abandon = renderHook(() => useMutateAbandonMockInterviewSessionSwr("course-1", "session-1"))
        const retry = renderHook(() => useMutateRetryMockInterviewSessionGradingSwr("course-1", "session-1"))

        await act(async () => {
            await complete.result.current.trigger(request)
            await abandon.result.current.trigger(request)
            await retry.result.current.trigger(request)
        })

        const options = { headers: { "X-Course-Id": "course-1" } }
        expect(mocks.complete).toHaveBeenCalledWith(request, options)
        expect(mocks.abandon).toHaveBeenCalledWith(request, options)
        expect(mocks.retry).toHaveBeenCalledWith(request, options)
    })

    it("does not execute a command merely because an incomplete scope rendered", () => {
        renderHook(() => useMutateCompleteMockInterviewSessionSwr(undefined, "session-1"))
        expect(mocks.complete).not.toHaveBeenCalled()
    })
})
