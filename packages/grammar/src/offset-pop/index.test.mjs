import assert from "node:assert/strict"
import test from "node:test"
import { offsetPopGrammar } from "../../dist/offset-pop/index.js"
test("offset-pop is visual data only", () => {
    assert.equal(offsetPopGrammar.id, "offset-pop")
    assert.equal("contracts" in offsetPopGrammar, false)
    assert.ok(offsetPopGrammar.complexCases.length > 0)
})
