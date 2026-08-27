import { describe, expect, it } from "vitest"
import {
    STARCI_ACADEMY_GRAMMAR_CONTRACTS,
} from "./grammar"
import { coreGrammar } from "@starci/grammar/core"

describe("StarCi Academy Grammar binding", () => {
    it("pins the source to one exact Core version", () => {
        expect(coreGrammar).toMatchObject({ id: "core", version: "1.4.0", extends: [] })
    })

    it("binds adapters directly to package anatomy without counterfeit product keys", () => {
        expect(STARCI_ACADEMY_GRAMMAR_CONTRACTS.surfaceCard.key).toBe("core.surface-card")
        expect(STARCI_ACADEMY_GRAMMAR_CONTRACTS.surfaceAccordionCard.key).toBe("core.surface-accordion-card")
        expect(STARCI_ACADEMY_GRAMMAR_CONTRACTS.markdownArticle.key).toBe("core.markdown-article")
        expect(STARCI_ACADEMY_GRAMMAR_CONTRACTS.rail.key).toBe("core.rail")
        expect(STARCI_ACADEMY_GRAMMAR_CONTRACTS.surfaceListCard.spec.closedInvariants)
            .toContain("one-collection-one-shell")
        expect(STARCI_ACADEMY_GRAMMAR_CONTRACTS.surfaceListCard.spec.closedInvariants)
            .toContain("static-row-hover-invariant")
        expect(STARCI_ACADEMY_GRAMMAR_CONTRACTS.markdownArticle.spec.closedInvariants)
            .toContain("inline-code-uses-neutral-chip-treatment")
        expect(STARCI_ACADEMY_GRAMMAR_CONTRACTS.visualTreatment.key).toBe("core.visual-treatment")
    })
})
