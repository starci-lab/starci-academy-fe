import assert from "node:assert/strict"
import test from "node:test"
import {
    CORE_COMPONENT_CONTRACTS,
    PRESENTATION_STATES,
    coreGrammar,
    surfaceCardContract,
    surfaceListCardContract,
    visualTreatmentContract,
} from "../../dist/core/index.js"

test("core exposes one closed neutral presentation vocabulary", () => {
    assert.deepEqual(PRESENTATION_STATES, [
        "neutral",
        "informative",
        "affirmative",
        "cautionary",
        "negative",
        "pending",
        "unavailable",
    ])
    assert.equal(coreGrammar.contractList.length, Object.keys(CORE_COMPONENT_CONTRACTS).length)
})

test("core locks difficult surface anatomy and opens only declared visual axes", () => {
    assert.ok(surfaceCardContract.spec.closedInvariants.includes("label-outside-surface"))
    assert.ok(surfaceListCardContract.spec.closedInvariants.includes("one-list-one-shell"))
    assert.ok(surfaceListCardContract.spec.closedInvariants.includes("nested-border-xor-shadow"))
    assert.deepEqual(visualTreatmentContract.spec.extensionPolicy.allowedAxes, [
        "palette",
        "display-type",
        "outline-shadow",
        "floating-composition",
        "motion",
    ])
})
