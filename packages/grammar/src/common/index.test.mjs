import assert from "node:assert/strict"
import test from "node:test"
import { PRESENTATION_STATES, assertPresentationState, isPresentationState } from "../../dist/common/index.js"
test("exports the neutral presentation state vocabulary", () => {
    assert.equal(PRESENTATION_STATES.length, 7)
    assert.equal(isPresentationState("affirmative"), true)
    assert.equal(isPresentationState("unknown"), false)
    assert.doesNotThrow(() => assertPresentationState("pending"))
    assert.throws(() => assertPresentationState("unknown"), TypeError)
})
