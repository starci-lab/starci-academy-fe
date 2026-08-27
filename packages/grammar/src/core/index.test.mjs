import assert from "node:assert/strict"
import test from "node:test"
import { coreGrammar, LeadingNumber, SurfaceCard, SurfaceListCard } from "../../dist/core/index.js"
test("exports traditional React components and visual rules", () => {
    assert.equal(coreGrammar.id, "core")
    assert.equal(typeof LeadingNumber, "function")
    assert.equal(typeof SurfaceCard, "function")
    assert.equal(typeof SurfaceListCard, "function")
    assert.equal("contracts" in coreGrammar, false)
})
