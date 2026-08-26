import {
    railContract,
    surfaceCardContract,
    surfaceListCardContract,
    visualTreatmentContract,
} from "@starci/grammar/core"

/**
 * The exact Core identities implemented by StarCi Academy's thin vendor adapters.
 *
 * The package owns reusable anatomy and neutral state. This source only declares that its existing
 * owners implement those contracts; business-specific registry keys remain in the application.
 * Empty product-prefixed extensions are deliberately refused because a new key is not conformance.
 */
export const STARCI_ACADEMY_GRAMMAR_CONTRACTS = Object.freeze({
    surfaceCard: surfaceCardContract,
    surfaceListCard: surfaceListCardContract,
    rail: railContract,
    visualTreatment: visualTreatmentContract,
})
