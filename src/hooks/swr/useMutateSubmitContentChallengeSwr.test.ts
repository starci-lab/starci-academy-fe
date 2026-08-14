import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useMutateSubmitContentChallengeSwr } from "./useMutateSubmitContentChallengeSwr"

const mocks = vi.hoisted(() => ({ mutationSubmitContentChallenge: vi.fn() }))

vi.mock("@/modules/api/graphql/mutations/mutation-submit-content-challenge", () => ({
    mutationSubmitContentChallenge: mocks.mutationSubmitContentChallenge,
}))

beforeEach(() => mocks.mutationSubmitContentChallenge.mockReset())

describe("useMutateSubmitContentChallengeSwr", () => {
    it("returns only a successful backend grading job", async () => {
        mocks.mutationSubmitContentChallenge.mockResolvedValue({
            data: {
                submitChallengeSubmission: {
                    success: true,
                    message: "Queued",
                    data: { jobId: "job-1" },
                },
            },
        })
        const { result } = renderHook(() => useMutateSubmitContentChallengeSwr())

        await act(async () => {
            await expect(result.current.trigger({
                courseId: "course-1",
                request: { challengeSubmissionId: "submission-1", githubUrl: "https://example.test/repo" },
            })).resolves.toEqual({ jobId: "job-1" })
        })
        expect(mocks.mutationSubmitContentChallenge).toHaveBeenCalledWith({
            request: { challengeSubmissionId: "submission-1", githubUrl: "https://example.test/repo" },
            headers: { "X-Course-Id": "course-1" },
        })
    })

    it("rejects a backend refusal instead of opening an empty result", async () => {
        mocks.mutationSubmitContentChallenge.mockResolvedValue({
            data: { submitChallengeSubmission: { success: false, message: "Repository required" } },
        })
        const { result } = renderHook(() => useMutateSubmitContentChallengeSwr())

        await act(async () => {
            await expect(result.current.trigger({
                courseId: "course-1",
                request: { challengeSubmissionId: "submission-1" },
            })).rejects.toThrow("Repository required")
        })
    })
})
