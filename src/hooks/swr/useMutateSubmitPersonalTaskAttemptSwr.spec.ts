import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useMutateSubmitPersonalTaskAttemptSwr } from "./useMutateSubmitPersonalTaskAttemptSwr"

const mocks = vi.hoisted(() => ({ mutateSubmitPersonalTaskAttempt: vi.fn() }))

vi.mock("@/modules/api/graphql/queries/query-course-personal-project", () => ({
    mutateSubmitPersonalTaskAttempt: mocks.mutateSubmitPersonalTaskAttempt,
}))

beforeEach(() => {
    mocks.mutateSubmitPersonalTaskAttempt.mockReset()
})

describe("useMutateSubmitPersonalTaskAttemptSwr", () => {
    it("returns the backend grading job only for a successful envelope", async () => {
        mocks.mutateSubmitPersonalTaskAttempt.mockResolvedValue({
            data: {
                reviewPersonalProjectTask: {
                    success: true,
                    message: "Queued",
                    data: { jobId: "job-1" },
                },
            },
        })
        const { result } = renderHook(() => useMutateSubmitPersonalTaskAttemptSwr())

        await act(async () => {
            await expect(result.current.trigger({ courseId: "course-1", taskId: "task-1" }))
                .resolves.toEqual({ jobId: "job-1" })
        })
        expect(mocks.mutateSubmitPersonalTaskAttempt).toHaveBeenCalledWith({
            courseId: "course-1",
            taskId: "task-1",
        })
    })

    it("rejects a GraphQL refusal instead of navigating to an empty result", async () => {
        mocks.mutateSubmitPersonalTaskAttempt.mockResolvedValue({
            data: {
                reviewPersonalProjectTask: {
                    success: false,
                    message: "Repository is not configured",
                    data: null,
                },
            },
        })
        const { result } = renderHook(() => useMutateSubmitPersonalTaskAttemptSwr())

        await act(async () => {
            await expect(result.current.trigger({ courseId: "course-1", taskId: "task-1" }))
                .rejects.toThrow("Repository is not configured")
        })
    })

    it("speaks for a server that refused without saying why", async () => {
        mocks.mutateSubmitPersonalTaskAttempt.mockResolvedValue({ data: undefined })
        const { result } = renderHook(() => useMutateSubmitPersonalTaskAttemptSwr())

        await act(async () => {
            await expect(result.current.trigger({ courseId: "course-1", taskId: "task-1" }))
                .rejects.toThrow("Personal-project review could not be started.")
        })
    })
})
