import { describe, expect, it } from "vitest"
import { isPersonalPrice } from "./course-price"
import type { CoursePricePreview } from "../api/graphql/queries/types/course-price-preview"

const preview = (phasePriceVnd: number, discountedPriceVnd: number): CoursePricePreview => ({
    originalPriceVnd: 2_000_000,
    phasePriceVnd,
    discountedPriceVnd,
    discountPercent: 25,
    discountReason: "enrolledCount",
    enrolledCount: 12,
    currentPhase: "earlyBird",
    nextPhasePriceVnd: null,
    seatsRemainingInCurrentPhase: null,
})

describe("isPersonalPrice", () => {
    it("recognizes a reckoning that actually takes something off the phase price", () => {
        expect(isPersonalPrice(preview(1_500_000, 1_200_000))).toBe(true)
    })

    it("refuses a preview that equals or exceeds the phase price", () => {
        expect(isPersonalPrice(preview(1_500_000, 1_500_000))).toBe(false)
        expect(isPersonalPrice(preview(1_500_000, 1_800_000))).toBe(false)
    })

    it("refuses an absent answer instead of reading through it", () => {
        expect(isPersonalPrice()).toBe(false)
        expect(isPersonalPrice(undefined)).toBe(false)
        expect(isPersonalPrice(null)).toBe(false)
    })
})
