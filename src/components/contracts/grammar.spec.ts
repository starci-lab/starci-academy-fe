import { describe, expect, it } from "vitest"
import {
    STARCI_ACADEMY_GRAMMAR,
    STARCI_ACADEMY_GRAMMAR_CONTRACTS,
} from "./grammar"

describe("StarCi Academy Grammar binding", () => {
    it("pins the source to one exact Core version", () => {
        expect(STARCI_ACADEMY_GRAMMAR.extends).toEqual([{ id: "core", version: "1.0.0" }])
    })

    it("inherits package anatomy without copying it into product contracts", () => {
        expect(STARCI_ACADEMY_GRAMMAR_CONTRACTS.surfaceCard.base).toMatchObject({
            key: "core.surface-card",
            version: "1.0.0",
        })
        expect(STARCI_ACADEMY_GRAMMAR_CONTRACTS.surfaceListCard.spec.closedInvariants)
            .toContain("one-list-one-shell")
        expect(STARCI_ACADEMY_GRAMMAR_CONTRACTS.visualTreatment.resolvedAxes).toEqual({})
    })
})
