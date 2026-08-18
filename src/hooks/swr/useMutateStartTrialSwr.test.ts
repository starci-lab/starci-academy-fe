/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MUTATE_START_TRIAL_SWR_KEY, useMutateStartTrialSwr } from "./useMutateStartTrialSwr"

/**
 * What these tests guard: the trial is per COURSE, so the key carries one; and the hook reports
 * the mutation's own outcome rather than swallowing it, because navigation is deliberately NOT
 * coupled to success here - the caller decides what a refusal means.
 */

const mocks = vi.hoisted(() => ({ mutationStartTrial: vi.fn() }))

vi.mock("../../modules/api/graphql/mutations/mutation-start-trial", () => ({
    mutationStartTrial: mocks.mutationStartTrial,
}))

/** What the transport answers for an opened trial. */
const opened = { data: { startTrial: { success: true, message: "Trial started" } } }

beforeEach(() => {
    mocks.mutationStartTrial.mockReset()
    mocks.mutationStartTrial.mockResolvedValue(opened)
})

describe("MUTATE_START_TRIAL_SWR_KEY", () => {
    it("is a stable prefix the course is appended to", () => {
        expect(MUTATE_START_TRIAL_SWR_KEY).toBe("MUTATE_START_TRIAL_SWR")
    })
})

describe("useMutateStartTrialSwr", () => {
    it("rests until pressed", () => {
        const { result } = renderHook(() => useMutateStartTrialSwr("course-1"))
        expect(mocks.mutationStartTrial).not.toHaveBeenCalled()
        expect(result.current.isMutating).toBe(false)
    })

    it("sends the course the press carries and hands back the outcome unchanged", async () => {
        const { result } = renderHook(() => useMutateStartTrialSwr("course-1"))

        await act(async () => {
            await expect(result.current.trigger({ courseId: "course-1" })).resolves.toEqual(opened)
        })
        expect(mocks.mutationStartTrial).toHaveBeenCalledWith({ courseId: "course-1" })
    })

    it("refuses the press while no course is named", async () => {
        const { result } = renderHook(() => useMutateStartTrialSwr())

        await act(async () => {
            await expect(result.current.trigger({ courseId: "course-1" })).rejects.toThrow()
        })
        expect(mocks.mutationStartTrial).not.toHaveBeenCalled()
    })

    it("hands back a server refusal as data, leaving the decision to the caller", async () => {
        const refused = { data: { startTrial: { success: false, message: "Trial already used" } } }
        mocks.mutationStartTrial.mockResolvedValue(refused)
        const { result } = renderHook(() => useMutateStartTrialSwr("course-1"))

        await act(async () => {
            await expect(result.current.trigger({ courseId: "course-1" })).resolves.toEqual(refused)
        })
        expect(result.current.error).toBeUndefined()
    })

    it("reports a transport failure as an error rather than as an opened trial", async () => {
        mocks.mutationStartTrial.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useMutateStartTrialSwr("course-1"))

        await act(async () => {
            await expect(result.current.trigger({ courseId: "course-1" })).rejects.toThrow("offline")
        })
        expect(result.current.error).toBeInstanceOf(Error)
    })
})
