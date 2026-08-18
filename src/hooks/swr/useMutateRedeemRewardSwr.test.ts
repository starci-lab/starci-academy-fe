/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MUTATE_REDEEM_REWARD_SWR_KEY, useMutateRedeemRewardSwr } from "./useMutateRedeemRewardSwr"

/**
 * What these tests guard: WHICH reward is spent is the trigger's to say, not the hook's - the
 * streak freeze goes through the same door as everything else - and it is spent on a press rather
 * than on a render, because points taken by merely opening a wallet cannot be given back.
 */

const mocks = vi.hoisted(() => ({ mutationRedeemReward: vi.fn() }))

vi.mock("../../modules/api/graphql/mutations/mutation-redeem-reward", () => ({
    mutationRedeemReward: mocks.mutationRedeemReward,
}))

/** What the transport answers for a spent reward. */
const spent = {
    data: { redeemReward: { success: true, message: "ok", data: { remainingPoints: 120 } } },
}

beforeEach(() => {
    mocks.mutationRedeemReward.mockReset()
    mocks.mutationRedeemReward.mockResolvedValue(spent)
})

describe("MUTATE_REDEEM_REWARD_SWR_KEY", () => {
    it("is one stable key", () => {
        expect(MUTATE_REDEEM_REWARD_SWR_KEY).toBe("MUTATE_REDEEM_REWARD_SWR")
    })
})

describe("useMutateRedeemRewardSwr", () => {
    it("spends nothing until the reader presses", () => {
        const { result } = renderHook(() => useMutateRedeemRewardSwr())
        expect(mocks.mutationRedeemReward).not.toHaveBeenCalled()
        expect(result.current.isMutating).toBe(false)
        expect(result.current.data).toBeUndefined()
    })

    it("wraps the trigger argument as the request and hands back the response", async () => {
        const { result } = renderHook(() => useMutateRedeemRewardSwr())

        const request = { rewardKey: "streakFreeze" }
        await act(async () => {
            await expect(result.current.trigger(request)).resolves.toEqual(spent)
        })
        expect(mocks.mutationRedeemReward).toHaveBeenCalledWith({ request })
    })

    it("hands back a refusal as data, so the wallet can say the balance was short", async () => {
        const refused = { data: { redeemReward: { success: false, message: "Not enough points" } } }
        mocks.mutationRedeemReward.mockResolvedValue(refused)
        const { result } = renderHook(() => useMutateRedeemRewardSwr())

        await act(async () => {
            await expect(result.current.trigger({ rewardKey: "streakFreeze" })).resolves.toEqual(refused)
        })
        expect(result.current.error).toBeUndefined()
    })

    it("reports a transport failure as an error rather than as a spent reward", async () => {
        mocks.mutationRedeemReward.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useMutateRedeemRewardSwr())

        await act(async () => {
            await expect(result.current.trigger({ rewardKey: "streakFreeze" })).rejects.toThrow("offline")
        })
        expect(result.current.error).toBeInstanceOf(Error)
        expect(result.current.data).toBeUndefined()
    })
})
