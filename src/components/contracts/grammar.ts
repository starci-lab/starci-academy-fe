import { extendGrammarContract } from "@starci/grammar/common"
import {
    railContract,
    surfaceCardContract,
    surfaceListCardContract,
    visualTreatmentContract,
} from "@starci/grammar/core"

const inheritCoreContract = <Base extends {
    readonly key: string
    readonly version: string
}>(id: string, base: Base) => ({
        id,
        version: "1.0.0",
        base: { key: base.key, version: base.version },
        axes: [],
        values: {},
    } as const)

/**
 * StarCi Academy's implementation identities.
 *
 * The package owns reusable anatomy and neutral state. This source only declares that its existing
 * owners inherit those contracts; business-specific registry keys remain in the application.
 */
export const STARCI_ACADEMY_GRAMMAR_CONTRACTS = Object.freeze({
    surfaceCard: extendGrammarContract(
        "starci-academy.surface-card",
        surfaceCardContract,
        inheritCoreContract("starci-academy.surface-card", surfaceCardContract),
    ),
    surfaceListCard: extendGrammarContract(
        "starci-academy.surface-list-card",
        surfaceListCardContract,
        inheritCoreContract("starci-academy.surface-list-card", surfaceListCardContract),
    ),
    rail: extendGrammarContract(
        "starci-academy.rail",
        railContract,
        inheritCoreContract("starci-academy.rail", railContract),
    ),
    visualTreatment: extendGrammarContract(
        "starci-academy.visual-treatment",
        visualTreatmentContract,
        inheritCoreContract("starci-academy.visual-treatment", visualTreatmentContract),
    ),
})

/** The exact Core version and application-owned extensions active in this source. */
export const STARCI_ACADEMY_GRAMMAR = Object.freeze({
    id: "starci-academy",
    version: "1.0.0",
    extends: Object.freeze([{ id: "core", version: "1.0.0" }]),
    contracts: STARCI_ACADEMY_GRAMMAR_CONTRACTS,
})
