/** Render-neutral states accepted by Grammar contracts. Product Blocks own every domain mapping. */
export const PRESENTATION_STATES = [
    "neutral",
    "informative",
    "affirmative",
    "cautionary",
    "negative",
    "pending",
    "unavailable",
] as const

export type PresentationState = (typeof PRESENTATION_STATES)[number]

const presentationStateSet: ReadonlySet<string> = new Set(PRESENTATION_STATES)

export const isPresentationState = (value: unknown): value is PresentationState => (
    typeof value === "string" && presentationStateSet.has(value)
)

export const assertPresentationState: (value: unknown) => asserts value is PresentationState = (value) => {
    if (!isPresentationState(value)) throw new TypeError(`Unknown neutral presentation state: ${JSON.stringify(value)}`)
}

/** Package-owned component tiers. The spelling matches the public export topology. */
export type GrammarLayer = "leaves" | "branch" | "composites"

/** Contract boundaries that an extension can never reopen. */
export type ClosedContractChange = "anatomy" | "closed-invariant" | "owner-substitution"

/** The only dimensions on which a derived Grammar may supply values. */
export type GrammarExtensionPolicy<Axis extends string = string> = Readonly<{
    allowedAxes: ReadonlyArray<Axis>
    forbiddenChanges: ReadonlyArray<ClosedContractChange>
}>

/** Business-neutral reusable owner contract. Additional package metadata must remain data-only. */
export type GrammarContractSpec<Axis extends string = string> = Readonly<{
    version: string
    layer: GrammarLayer
    slots: ReadonlyArray<string>
    stateInputs: ReadonlyArray<string>
    variableAxes: ReadonlyArray<Axis>
    extensionPolicy: GrammarExtensionPolicy<Axis>
    closedInvariants: ReadonlyArray<string>
}>

/** One declared derivation. Every value key must have a matching requested axis. */
export type GrammarContractExtension<Axis extends string = string> = Readonly<{
    id: string
    version: string
    base: Readonly<{
        key: string
        version: string
    }>
    axes: ReadonlyArray<Axis>
    values: Readonly<Record<Axis, unknown>>
}>

/** Immutable provenance for a contract derived from another contract. */
export type GrammarContractBase = Readonly<{
    key: string
    version: string
    rootKey: string
    rootVersion: string
}>

/** A closed, runtime-validated contract value. */
export type GrammarContract<
    Key extends string = string,
    Spec extends GrammarContractSpec = GrammarContractSpec,
> = Readonly<{
    key: Key
    version: string
    spec: Readonly<Spec>
    base: GrammarContractBase | null
    resolvedAxes: Readonly<Record<string, unknown>>
}>

/** Stable refusal identities for callers and tests. */
export type GrammarContractErrorCode =
    | "invalid-key"
    | "invalid-version"
    | "invalid-spec"
    | "duplicate-entry"
    | "allowed-axis-not-variable"
    | "duplicate-contract-key"
    | "missing-base-contract"
    | "same-extension-key"
    | "extension-id-mismatch"
    | "extension-base-mismatch"
    | "axis-not-allowed"
    | "axis-already-resolved"
    | "missing-axis-value"
    | "undeclared-axis-value"
    | "cyclic-value"
    | "unsupported-value"

/** Fail-closed error emitted by every runtime guard in this module. */
export class GrammarContractError extends Error {
    readonly code: GrammarContractErrorCode

    constructor(code: GrammarContractErrorCode, message: string) {
        super(message)
        this.name = "GrammarContractError"
        this.code = code
    }
}

const stableKeyPattern = /^[a-z0-9]+(?:[./-][a-z0-9]+)*$/
const exactVersionPattern = /^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?$/
const requiredForbiddenChanges: ReadonlyArray<ClosedContractChange> = [
    "anatomy",
    "closed-invariant",
    "owner-substitution",
]

const fail = (code: GrammarContractErrorCode, message: string): never => {
    throw new GrammarContractError(code, message)
}

const validateStableKey = (value: string, label: string) => {
    if (!stableKeyPattern.test(value)) fail("invalid-key", `${label} must be a stable lowercase key: ${value}`)
}

const validateExactVersion = (value: string, label: string) => {
    if (!exactVersionPattern.test(value)) {
        fail("invalid-version", `${label} must be one exact semantic version: ${value}`)
    }
}

const validateStringSet = (values: ReadonlyArray<string>, label: string) => {
    if (!Array.isArray(values)) fail("invalid-spec", `${label} must be an array`)
    const seen = new Set<string>()
    for (const value of values) {
        if (typeof value !== "string" || value.length === 0 || value.trim() !== value) {
            fail("invalid-spec", `${label} contains an empty or untrimmed value`)
        }
        validateStableKey(value, label)
        if (seen.has(value)) fail("duplicate-entry", `${label} contains duplicate value: ${value}`)
        seen.add(value)
    }
}

const cloneClosed = (value: unknown, path: string, ancestors: WeakSet<object>): unknown => {
    if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value
    if (Array.isArray(value)) {
        if (ancestors.has(value)) fail("cyclic-value", `${path} contains a cycle`)
        ancestors.add(value)
        const copy = value.map((item, index) => cloneClosed(item, `${path}[${index}]`, ancestors))
        ancestors.delete(value)
        return Object.freeze(copy)
    }
    if (typeof value === "object") {
        if (ancestors.has(value)) fail("cyclic-value", `${path} contains a cycle`)
        const prototype = Object.getPrototypeOf(value)
        if (prototype !== Object.prototype && prototype !== null) {
            fail("unsupported-value", `${path} must contain only plain data`)
        }
        ancestors.add(value)
        const copy: Record<string, unknown> = {}
        for (const [key, child] of Object.entries(value)) copy[key] = cloneClosed(child, `${path}.${key}`, ancestors)
        ancestors.delete(value)
        return Object.freeze(copy)
    }
    return fail("unsupported-value", `${path} contains unsupported ${typeof value}`)
}

const closedCopy = <Value>(value: Value, path: string): Readonly<Value> => (
    cloneClosed(value, path, new WeakSet<object>()) as Readonly<Value>
)

const validateSpec = <Spec extends GrammarContractSpec>(spec: Spec) => {
    if (spec === null || typeof spec !== "object") fail("invalid-spec", "contract spec must be an object")
    validateExactVersion(spec.version, "contract version")
    if (!(["leaves", "branch", "composites"] as ReadonlyArray<string>).includes(spec.layer)) {
        fail("invalid-spec", `unsupported Grammar layer: ${String(spec.layer)}`)
    }
    validateStringSet(spec.slots, "slots")
    validateStringSet(spec.stateInputs, "stateInputs")
    validateStringSet(spec.variableAxes, "variableAxes")
    if (spec.extensionPolicy === null || typeof spec.extensionPolicy !== "object") {
        fail("invalid-spec", "extensionPolicy must be an object")
    }
    validateStringSet(spec.extensionPolicy.allowedAxes, "extensionPolicy.allowedAxes")
    validateStringSet(spec.extensionPolicy.forbiddenChanges, "extensionPolicy.forbiddenChanges")
    validateStringSet(spec.closedInvariants, "closedInvariants")
    const variableAxes = new Set<string>(spec.variableAxes)
    for (const axis of spec.extensionPolicy.allowedAxes) {
        if (!variableAxes.has(axis)) {
            fail("allowed-axis-not-variable", `allowed extension axis is not a variable axis: ${axis}`)
        }
    }
    for (const change of requiredForbiddenChanges) {
        if (!spec.extensionPolicy.forbiddenChanges.includes(change)) {
            fail("invalid-spec", `extensionPolicy.forbiddenChanges must include ${change}`)
        }
    }
}

/** Define one immutable base contract after validating its closed boundaries. */
export const defineGrammarContract = <
    const Key extends string,
    const Spec extends GrammarContractSpec,
>(
        key: Key,
        spec: Spec,
    ): GrammarContract<Key, Spec> => {
    validateStableKey(key, "contract key")
    validateSpec(spec)
    return Object.freeze({
        key,
        version: spec.version,
        spec: closedCopy(spec, `contract ${key}`),
        base: null,
        resolvedAxes: Object.freeze({}),
    })
}

/** Derive a contract by resolving declared axes without changing its base anatomy or invariants. */
export const extendGrammarContract = <
    const Key extends string,
    Spec extends GrammarContractSpec,
    Axis extends string,
>(
        key: Key,
        base: GrammarContract<string, Spec>,
        extension: GrammarContractExtension<Axis>,
    ): GrammarContract<Key, Spec> => {
    validateStableKey(key, "extension key")
    validateStableKey(extension.id, "extension id")
    validateExactVersion(extension.version, "extension version")
    validateStableKey(extension.base.key, "extension base key")
    validateExactVersion(extension.base.version, "extension base version")
    if (key === base.key) fail("same-extension-key", `extension key must differ from base key: ${key}`)
    if (extension.id !== key) {
        fail("extension-id-mismatch", `extension id ${extension.id} does not match registered key ${key}`)
    }
    if (extension.base.key !== base.key || extension.base.version !== base.version) {
        fail(
            "extension-base-mismatch",
            `extension base ${extension.base.key}@${extension.base.version} does not match ${base.key}@${base.version}`,
        )
    }
    validateStringSet(extension.axes, "extension.axes")
    if (extension.values === null || typeof extension.values !== "object" || Array.isArray(extension.values)) {
        fail("invalid-spec", "extension.values must be an object")
    }
    const requested = new Set<string>(extension.axes)
    const allowed = new Set<string>(base.spec.extensionPolicy.allowedAxes)
    for (const axis of extension.axes) {
        if (!allowed.has(axis)) fail("axis-not-allowed", `extension axis is closed: ${axis}`)
        if (Object.hasOwn(base.resolvedAxes, axis)) {
            fail("axis-already-resolved", `extension axis is already resolved: ${axis}`)
        }
        if (!Object.hasOwn(extension.values, axis)) fail("missing-axis-value", `extension axis has no value: ${axis}`)
    }
    for (const axis of Object.keys(extension.values)) {
        if (!requested.has(axis)) fail("undeclared-axis-value", `extension value has no declared axis: ${axis}`)
    }
    const values = closedCopy(extension.values, `extension ${key}`)
    const baseRef = Object.freeze({
        key: base.key,
        version: base.version,
        rootKey: base.base?.rootKey ?? base.key,
        rootVersion: base.base?.rootVersion ?? base.version,
    })
    return Object.freeze({
        key,
        version: extension.version,
        spec: base.spec,
        base: baseRef,
        resolvedAxes: Object.freeze({ ...base.resolvedAxes, ...values }),
    })
}

/** Typed in-memory registry used by each Grammar bundle while it assembles its public contracts. */
export type GrammarContractRegistry<Spec extends GrammarContractSpec> = Readonly<{
    define: <const Key extends string, const Input extends Spec>(key: Key, spec: Input) => GrammarContract<Key, Input>
    extend: <const Key extends string, Axis extends string>(
        key: Key,
        baseKey: string,
        extension: GrammarContractExtension<Axis>,
    ) => GrammarContract<Key, Spec>
    register: <const Key extends string, const Input extends Spec>(contract: GrammarContract<Key, Input>) => GrammarContract<Key, Input>
    get: (key: string) => GrammarContract<string, Spec> | undefined
    require: (key: string) => GrammarContract<string, Spec>
    has: (key: string) => boolean
    entries: () => ReadonlyArray<GrammarContract<string, Spec>>
}>

/** Create an isolated fail-closed registry. Duplicate keys never replace an earlier contract. */
export const createContractRegistry = <Spec extends GrammarContractSpec>(): GrammarContractRegistry<Spec> => {
    const contracts = new Map<string, GrammarContract<string, Spec>>()

    const register = <const Key extends string, const Input extends Spec>(contract: GrammarContract<Key, Input>) => {
        if (contracts.has(contract.key)) {
            fail("duplicate-contract-key", `contract key is already registered: ${contract.key}`)
        }
        contracts.set(contract.key, contract)
        return contract
    }

    const requireContract = (key: string): GrammarContract<string, Spec> => {
        const contract = contracts.get(key)
        if (contract === undefined) {
            return fail("missing-base-contract", `contract key is not registered: ${key}`)
        }
        return contract
    }

    return Object.freeze({
        define: <const Key extends string, const Input extends Spec>(key: Key, spec: Input) => (
            register(defineGrammarContract(key, spec))
        ),
        extend: <const Key extends string, Axis extends string>(
            key: Key,
            baseKey: string,
            extension: GrammarContractExtension<Axis>,
        ) => register(extendGrammarContract(key, requireContract(baseKey), extension)),
        register,
        get: (key: string) => contracts.get(key),
        require: requireContract,
        has: (key: string) => contracts.has(key),
        entries: () => Object.freeze(Array.from(contracts.values())),
    })
}
