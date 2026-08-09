import { describe, expect, it } from "vitest"
import {
    type MyAiCreditData,
    type MyAiQuotaData,
    type QueryMyAiQuotaResponse,
} from "./my-ai-quota"

/**
 * What these tests guard: the credit pair stays NESTED under `credit`. The back end puts it
 * one level down, and a type that flattened `remainingWeek` onto the payload would read as
 * `undefined` at runtime while compiling perfectly - the worst shape of this bug, because a
 * quota row would then render a plausible-looking zero.
 */

/** The weekly pair, spelled exactly as the back end spells it. */
const credit: MyAiCreditData = { limitWeek: 500, remainingWeek: 120 }

/** A healthy payload. */
const quota: MyAiQuotaData = { credit }

describe("QueryMyAiQuotaResponse", () => {
    it("nests the quota under the standard envelope", () => {
        const response: QueryMyAiQuotaResponse = {
            myAiQuota: { success: true, message: "ok", data: quota },
        }
        expect(response.myAiQuota.data?.credit.remainingWeek).toBe(120)
        expect(response.myAiQuota.data?.credit.limitWeek).toBe(500)
    })

    it("describes a failure with no quota at all", () => {
        const response: QueryMyAiQuotaResponse = {
            myAiQuota: { success: false, message: "unauthorised", error: "UNAUTHENTICATED" },
        }
        expect(response.myAiQuota.data).toBeUndefined()
    })
})

describe("MyAiQuotaData", () => {
    it("holds the credit object and nothing else", () => {
        expect(Object.keys(quota)).toEqual(["credit"])
    })

    it("selects only the WEEKLY window, not the five-hour one", () => {
        expect(Object.keys(credit)).toEqual(["limitWeek", "remainingWeek"])
    })

    it("allows a fully spent allowance, which is a real answer and not an absent one", () => {
        const spent: MyAiQuotaData = { credit: { limitWeek: 500, remainingWeek: 0 } }
        expect(spent.credit.remainingWeek).toBe(0)
    })
})
