/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    MUTATE_CLAIM_WEEKLY_CHALLENGE_REWARD_SWR_KEY,
    useMutateClaimWeeklyChallengeRewardSwr,
} from "./useMutateClaimWeeklyChallengeRewardSwr"

/**
 * What these tests guard: the claim carries no argument at all - the featured challenge and the
 * asking learner are both the server's to decide - and it does not fire on mount. A reward claimed
 * merely by rendering a board would be spent before the reader ever pressed anything.
 */

const mocks = vi.hoisted(() => ({ mutationClaimWeeklyChallengeReward: vi.fn() }))

vi.mock("../../modules/api/graphql/mutations/mutation-claim-weekly-challenge-reward", () => ({
    mutationClaimWeeklyChallengeReward: mocks.mutationClaimWeeklyChallengeReward,
}))

/** What the transport answers for a granted claim. */
const granted = {
    data: { claimWeeklyChallengeReward: { success: true, message: "Claimed", data: { points: 200 } } },
}

beforeEach(() => {
    mocks.mutationClaimWeeklyChallengeReward.mockReset()
    mocks.mutationClaimWeeklyChallengeReward.mockResolvedValue(granted)
})

describe("MUTATE_CLAIM_WEEKLY_CHALLENGE_REWARD_SWR_KEY", () => {
    it("is one stable key", () => {
        expect(MUTATE_CLAIM_WEEKLY_CHALLENGE_REWARD_SWR_KEY)
            .toBe("MUTATE_CLAIM_WEEKLY_CHALLENGE_REWARD_SWR")
    })
})

describe("useMutateClaimWeeklyChallengeRewardSwr", () => {
    it("claims nothing until the reader presses", () => {
        const { result } = renderHook(() => useMutateClaimWeeklyChallengeRewardSwr())
        expect(mocks.mutationClaimWeeklyChallengeReward).not.toHaveBeenCalled()
        expect(result.current.isMutating).toBe(false)
        expect(result.current.data).toBeUndefined()
    })

    it("claims without variables and hands back the response", async () => {
        const { result } = renderHook(() => useMutateClaimWeeklyChallengeRewardSwr())

        await act(async () => {
            await expect(result.current.trigger()).resolves.toEqual(granted)
        })
        expect(mocks.mutationClaimWeeklyChallengeReward).toHaveBeenCalledTimes(1)
        expect(mocks.mutationClaimWeeklyChallengeReward).toHaveBeenCalledWith()
    })

    it("hands back a refused claim as data, so the board can say why", async () => {
        const refused = {
            data: { claimWeeklyChallengeReward: { success: false, message: "Already claimed" } },
        }
        mocks.mutationClaimWeeklyChallengeReward.mockResolvedValue(refused)
        const { result } = renderHook(() => useMutateClaimWeeklyChallengeRewardSwr())

        await act(async () => {
            await expect(result.current.trigger()).resolves.toEqual(refused)
        })
        expect(result.current.error).toBeUndefined()
    })

    it("reports a transport failure as an error rather than as a granted reward", async () => {
        mocks.mutationClaimWeeklyChallengeReward.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useMutateClaimWeeklyChallengeRewardSwr())

        await act(async () => {
            await expect(result.current.trigger()).rejects.toThrow("offline")
        })
        expect(result.current.error).toBeInstanceOf(Error)
        expect(result.current.data).toBeUndefined()
    })
})
