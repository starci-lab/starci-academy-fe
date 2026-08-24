import assert from "node:assert/strict"
import test from "node:test"
import {
    GrammarContractError,
    createContractRegistry,
    defineGrammarContract,
    extendGrammarContract,
} from "../../dist/common/index.js"

const baseSpec = () => ({
    version: "1.0.0",
    layer: "branch",
    slots: ["body"],
    stateInputs: ["presentation-state"],
    variableAxes: ["surface-tone", "density"],
    extensionPolicy: {
        allowedAxes: ["surface-tone"],
        forbiddenChanges: ["anatomy", "closed-invariant", "owner-substitution"],
    },
    closedInvariants: ["one-owner", "label-outside-surface"],
    metadata: { proofIds: ["surface-golden"] },
})

const refuses = (code) => (error) => error instanceof GrammarContractError && error.code === code

const extension = (id, axes, values, base = { key: "core.surface", version: "1.0.0" }) => ({
    id,
    version: "1.0.0",
    base,
    axes,
    values,
})

test("defines a deeply immutable business-neutral contract", () => {
    const contract = defineGrammarContract("core.surface", baseSpec())
    assert.equal(contract.spec.layer, "branch")
    assert.deepEqual(contract.spec.metadata.proofIds, ["surface-golden"])
    assert.throws(() => contract.spec.slots.push("other"), TypeError)
    assert.throws(() => contract.spec.metadata.proofIds.push("other"), TypeError)
})

test("registry refuses a duplicate contract key", () => {
    const registry = createContractRegistry()
    registry.define("core.surface", baseSpec())
    assert.throws(() => registry.define("core.surface", baseSpec()), refuses("duplicate-contract-key"))
    assert.equal(registry.entries().length, 1)
})

test("definition rejects duplicate members and allowed axes outside variable axes", () => {
    const duplicate = baseSpec()
    duplicate.slots = ["body", "body"]
    assert.throws(() => defineGrammarContract("core.duplicate", duplicate), refuses("duplicate-entry"))

    const closed = baseSpec()
    closed.extensionPolicy.allowedAxes = ["unknown-axis"]
    assert.throws(() => defineGrammarContract("core.closed", closed), refuses("allowed-axis-not-variable"))
})

test("extension resolves only declared open axes and keeps base anatomy", () => {
    const base = defineGrammarContract("core.surface", baseSpec())
    const derived = extendGrammarContract(
        "offset-pop.surface",
        base,
        extension("offset-pop.surface", ["surface-tone"], { "surface-tone": "offset-pop" }),
    )
    assert.equal(derived.base.key, "core.surface")
    assert.equal(derived.base.version, "1.0.0")
    assert.equal(derived.base.rootKey, "core.surface")
    assert.equal(derived.resolvedAxes["surface-tone"], "offset-pop")
    assert.strictEqual(derived.spec, base.spec)
})

test("extension refuses closed, missing, extra and already-resolved axes", () => {
    const base = defineGrammarContract("core.surface", baseSpec())
    assert.throws(() => extendGrammarContract(
        "offset-pop.density",
        base,
        extension("offset-pop.density", ["density"], { density: "compact" }),
    ), refuses("axis-not-allowed"))
    assert.throws(() => extendGrammarContract(
        "offset-pop.missing",
        base,
        extension("offset-pop.missing", ["surface-tone"], {}),
    ), refuses("missing-axis-value"))
    assert.throws(() => extendGrammarContract(
        "offset-pop.extra",
        base,
        extension("offset-pop.extra", ["surface-tone"], { "surface-tone": "offset-pop", density: "compact" }),
    ), refuses("undeclared-axis-value"))

    const derived = extendGrammarContract(
        "offset-pop.surface",
        base,
        extension("offset-pop.surface", ["surface-tone"], { "surface-tone": "offset-pop" }),
    )
    assert.throws(() => extendGrammarContract(
        "other.surface",
        derived,
        extension("other.surface", ["surface-tone"], { "surface-tone": "other" }, {
            key: "offset-pop.surface",
            version: "1.0.0",
        }),
    ), refuses("axis-already-resolved"))
})

test("extension validates its identity, exact version and base lock", () => {
    const base = defineGrammarContract("core.surface", baseSpec())
    assert.throws(() => extendGrammarContract(
        "offset-pop.surface",
        base,
        extension("offset-pop.other", ["surface-tone"], { "surface-tone": "offset-pop" }),
    ), refuses("extension-id-mismatch"))
    assert.throws(() => extendGrammarContract("offset-pop.surface", base, {
        ...extension("offset-pop.surface", ["surface-tone"], { "surface-tone": "offset-pop" }),
        version: "^1.0.0",
    }), refuses("invalid-version"))
    assert.throws(() => extendGrammarContract(
        "offset-pop.surface",
        base,
        extension("offset-pop.surface", ["surface-tone"], { "surface-tone": "offset-pop" }, {
            key: "core.other",
            version: "1.0.0",
        }),
    ), refuses("extension-base-mismatch"))
})

test("registry extension requires an existing base", () => {
    const registry = createContractRegistry()
    assert.throws(() => registry.extend(
        "offset-pop.surface",
        "core.surface",
        extension("offset-pop.surface", ["surface-tone"], { "surface-tone": "offset-pop" }),
    ), refuses("missing-base-contract"))
})
