import assert from "node:assert/strict"
import test from "node:test"
import {
    OFFSET_POP_COMPLEX_CASES,
    offsetPopGrammar,
    offsetPopVisualTreatmentContract,
} from "../../dist/offset-pop/index.js"

test("offset-pop is a declared, version-pinned extension of core visual treatment", () => {
    assert.equal(offsetPopGrammar.extends[0]?.id, "core")
    assert.equal(offsetPopGrammar.extends[0]?.version, "1.1.0")
    assert.equal(offsetPopVisualTreatmentContract.base?.key, "core.visual-treatment")
    assert.equal(offsetPopVisualTreatmentContract.base?.version, "1.0.0")
    assert.deepEqual(Object.keys(offsetPopVisualTreatmentContract.resolvedAxes).sort(), [
        "display-type",
        "floating-composition",
        "motion",
        "outline-shadow",
        "palette",
    ])
})

test("offset-pop keeps the difficult rendering cases explicit", () => {
    assert.ok(OFFSET_POP_COMPLEX_CASES.length >= 10)
    assert.ok(OFFSET_POP_COMPLEX_CASES.includes("nested-surface-keeps-one-outline-and-no-second-shadow"))
    assert.ok(OFFSET_POP_COMPLEX_CASES.includes("long-copy-reduces-rotation-before-truncation"))
})
