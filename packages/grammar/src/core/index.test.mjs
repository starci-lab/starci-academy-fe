import assert from "node:assert/strict"
import test from "node:test"
import {
    CORE_COMPONENT_CONTRACTS,
    PRESENTATION_STATES,
    CORE_LAYOUT_CLASS_NAMES,
    StateMark,
    StaticStateRow,
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

test("core exports product-neutral leaf, composite and layout capabilities", () => {
    assert.equal(typeof StateMark, "function")
    assert.equal(typeof StaticStateRow, "function")
    assert.ok(CORE_LAYOUT_CLASS_NAMES.includes("flex"))
    assert.ok(CORE_LAYOUT_CLASS_NAMES.includes("[&>*]:w-full"))
    assert.ok(CORE_LAYOUT_CLASS_NAMES.includes("[&>*]:max-w-md"))
    assert.ok(!CORE_LAYOUT_CLASS_NAMES.some((name) => name.includes("app-") || name.includes("data-node")))
})

test("core locks difficult surface anatomy and opens only declared visual axes", () => {
    assert.ok(surfaceCardContract.spec.closedInvariants.includes("label-outside-surface"))
    assert.ok(surfaceListCardContract.spec.closedInvariants.includes("one-collection-one-shell"))
    assert.ok(surfaceListCardContract.spec.closedInvariants.includes("nested-border-xor-shadow"))
    assert.ok(surfaceCardContract.spec.variableAxes.includes("frame-mode"))
    assert.ok(surfaceListCardContract.spec.variableAxes.includes("row-mode"))
    assert.ok(CORE_COMPONENT_CONTRACTS["core.rail"].spec.variableAxes.includes("collapse-mode"))
    assert.deepEqual(visualTreatmentContract.spec.extensionPolicy.allowedAxes, [
        "palette",
        "display-type",
        "outline-shadow",
        "floating-composition",
        "motion",
    ])
})
