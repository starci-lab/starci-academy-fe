import { describe, expect, it } from "vitest"
import {
    badgeToneFor,
    iconTileToneFor,
    verdictForPercent,
    type SemanticVerdict,
} from "@/components/composites/_semantic-contracts"

/**
 * What these tests guard: that a state has ONE meaning across the two atoms that can say it, and
 * that a completion figure cannot be talked into meaning something it does not. The failure this
 * file exists to prevent is two surfaces classifying the same verdict differently - at which
 * point the tone has stopped carrying information and has become decoration.
 */

/** Every verdict, mirrored so a loop can walk the whole vocabulary. */
const VERDICTS: ReadonlyArray<SemanticVerdict> = ["passed", "progress", "attention", "failed", "neutral"]

describe("semantic contracts", () => {
    it("gives every verdict a tone in both vocabularies", () => {
        for (const verdict of VERDICTS) {
            expect(badgeToneFor(verdict), verdict).toBeDefined()
            expect(iconTileToneFor(verdict), verdict).toBeDefined()
        }
    })

    it("says the same thing in both vocabularies, so two atoms cannot disagree", () => {
        for (const verdict of VERDICTS) {
            expect(iconTileToneFor(verdict), verdict).toBe(badgeToneFor(verdict))
        }
    })

    it("keeps the five meanings distinct - a tone shared by two verdicts classifies neither", () => {
        const tones = new Set(VERDICTS.map((verdict) => badgeToneFor(verdict)))
        expect(tones.size).toBe(VERDICTS.length)
    })

    it("holds no colour of its own: every value is a token name", () => {
        for (const verdict of VERDICTS) {
            expect(badgeToneFor(verdict), verdict).not.toMatch(/^#|rgb|oklch/)
        }
    })

    it("reads a finished thing as finished and an untouched one as a plain fact", () => {
        expect(verdictForPercent(100)).toBe("passed")
        expect(verdictForPercent(0)).toBe("neutral")
    })

    it("reads anything in between as under way, never as a success", () => {
        expect(verdictForPercent(1)).toBe("progress")
        expect(verdictForPercent(99)).toBe("progress")
    })
})
