import { describe, expect, it } from "vitest"
import { type MyRewardWalletData, type QueryMyRewardWalletResponse } from "./my-reward-wallet"

/**
 * What these tests guard: the wallet stays ONE number. `spent` and `redemptions` sit beside
 * `balance` on the back end, and adding either here without adding it to the document would
 * hand a reader a field that is always `undefined`.
 */

/** A healthy payload. */
const wallet: MyRewardWalletData = { balance: 240 }

describe("QueryMyRewardWalletResponse", () => {
    it("nests the balance under the standard envelope", () => {
        const response: QueryMyRewardWalletResponse = {
            myRewardWallet: { success: true, message: "ok", data: wallet },
        }
        expect(response.myRewardWallet.data?.balance).toBe(240)
    })

    it("describes a failure with no wallet at all", () => {
        const response: QueryMyRewardWalletResponse = {
            myRewardWallet: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" },
        }
        expect(response.myRewardWallet.data).toBeUndefined()
    })
})

describe("MyRewardWalletData", () => {
    it("holds the balance and nothing else", () => {
        expect(Object.keys(wallet)).toEqual(["balance"])
    })

    it("allows an empty wallet, which is a real answer and not an absent one", () => {
        const empty: MyRewardWalletData = { balance: 0 }
        expect(empty.balance).toBe(0)
    })
})
