import assert from "node:assert/strict"
import test from "node:test"
import * as core from "../../dist/core/index.js"

test("exports traditional React components without metadata registries", () => {
    assert.equal(typeof core.LeadingNumber, "function")
    assert.equal(typeof core.SurfaceCard, "function")
    assert.equal(typeof core.SurfaceListCard, "function")
    assert.equal("coreGrammar" in core, false)
    assert.equal("CORE_RULES" in core, false)
    assert.equal("CORE_LAYOUT_CLASS_NAMES" in core, false)
    assert.equal("CORE_NEUTRAL_TREATMENTS" in core, false)
    assert.equal("treatmentFor" in core, false)
})
