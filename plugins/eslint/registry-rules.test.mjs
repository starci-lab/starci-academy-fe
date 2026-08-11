/**
 * Regression tests for the named-registry rules.
 *
 *   node --test plugins/eslint/registry-rules.test.mjs
 *
 * The key and role cases run against REAL paths inside this repository, so the rules read
 * the actual `src/components/contracts/index.ts` rather than a copy of its vocabulary. That is
 * the point of the registry: there is one list, and even the tests do not restate it.
 */
import assert from "node:assert/strict"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import test from "node:test"
import { RuleTester } from "eslint"
import tsParser from "@typescript-eslint/parser"
import { parseKeys, readRegistry } from "./registry.mjs"
import {
  noClassCompositionOutsideRegistry,
  noHandWrittenRegistryAttrs,
  noLiteralStructuralClass,
  noUnregisteredTreeKey,
  registryChildrenAreTyped,
  registryExplainIsAReason,
} from "./registry-rules.mjs"

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

test("parseKeys stops at the balanced contract table", () => {
  const source = `
const first = buildContracts({
    "node-key": { children: { compound: { contract: "nested-key" } } },
})
const unrelated = {
    "compound-message-id": { value: true },
}
`
  assert.deepEqual(parseKeys(source), ["node-key"])
})

test("registry-children-are-typed closes identity, literal-prop and repetition holes", () => {
  tester.run("registry-children-are-typed", registryChildrenAreTyped, {
    valid: [
      {
        filename: REGISTRY,
        code: "buildContracts({ card: { classes: [], children: { row: { leaf: 'text', props: { size: 'sm' }, repeats: true, restingCount: 6 } }, why: 'A sufficiently long reason lives here because this fixture exercises only the child schema.' } })",
      },
      {
        filename: REGISTRY,
        code: "buildContracts({ card: { classes: [], children: { body: { leaf: ['form'], contract: ['field-stack'], repeats: true, restingCount: 0 } }, why: 'A named slot may admit a closed union across tiers without admitting arbitrary markup.' } })",
      },
    ],
    invalid: [
      {
        filename: REGISTRY,
        code: "buildContracts({ card: { classes: [], why: 'A sufficiently long reason lives here because this fixture exercises only the child schema.' } })",
        errors: [{ messageId: "missing" }],
      },
      {
        filename: REGISTRY,
        code: "buildContracts({ card: { classes: [], children: { row: { repeats: true, restingCount: 2 } }, why: 'A sufficiently long reason lives here because this fixture exercises only the child schema.' } })",
        errors: [{ messageId: "identity" }],
      },
      {
        filename: REGISTRY,
        code: "buildContracts({ card: { classes: [], children: { row: { leaf: 'text', repeats: true } }, why: 'A sufficiently long reason lives here because this fixture exercises only the child schema.' } })",
        errors: [{ messageId: "resting" }],
      },
      {
        filename: REGISTRY,
        code: "buildContracts({ card: { classes: [], children: { row: { leaf: 'text', restingCount: 6 } }, why: 'A sufficiently long reason lives here because this fixture exercises only the child schema.' } })",
        errors: [{ messageId: "strayResting" }],
      },
    ],
  })
})

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..")
/** A real path inside this repository, so the registry above it is the real one. */
const inRepo = (relative) => join(repoRoot, relative).replace(/\\/g, "/")

const BLOCK = "D:/repo/src/components/blocks/example/Example/index.tsx"
const REGISTRY = "D:/repo/src/components/contracts/index.ts"

test("the registry parses into the keys the repository actually declares", () => {
  const registry = readRegistry(inRepo("src/components/blocks/example/Example/index.tsx"))
  assert.ok(registry, "expected the repository registry to be readable")
  assert.ok(registry.keys.includes("title-with-baseline-fact"))
  assert.equal(registry.keys.includes("content-row"), false)
      })

test("no-literal-structural-class sends every structural node back to a registry key", () => {
  tester.run("no-literal-structural-class", noLiteralStructuralClass, {
    valid: [
      {
        filename: BLOCK,
        code: "export const Example = () => <Tree contract=\"title-with-baseline-fact\" slots={{ field: F, action: A }} />",
      },
      {
        // Appearance on a leaf is the leaf's own business; the TREE is what the registry owns.
        filename: BLOCK,
        code: "export const Example = () => <span className=\"text-sm text-muted\" />",
      },
      {
        // The registry is the one file allowed to write a class string.
        filename: REGISTRY,
        code: "export const CONTRACTS = { card: { classes: \"flex flex-col gap-4\" } }",
      },
      {
        // A twin test may build fixture markup by hand.
        filename: "D:/repo/src/components/blocks/example/Example/index.test.tsx",
        code: "const fixture = () => <div className=\"flex gap-2\" />",
      },
      {
        // A named surface host owns its one fixed wrapper seam around checked contract content.
        filename: "D:/repo/src/components/branches/SurfaceListCard/index.tsx",
        code: "export const SurfaceListCard = () => <div className=\"flex flex-col gap-3\" />",
      },
    ],
    invalid: [
      {
        filename: BLOCK,
        code: "export const Example = () => <Row className=\"flex flex-row gap-2\" />",
        errors: [{ messageId: "structural", data: { cls: "flex" } }],
      },
      {
        filename: "D:/repo/src/components/atoms/display/Badge/index.tsx",
        code: "export const Badge = () => <span className=\"items-center\" />",
        errors: [{ messageId: "structural", data: { cls: "items-center" } }],
      },
      {
        filename: "D:\\repo\\src\\app\\dashboard\\page.tsx",
        code: "export const Page = () => <Shell className=\"lg:grid-cols-2\" />",
        errors: [{ messageId: "structural", data: { cls: "grid-cols-2" } }],
      },
    ],
  })
})

test("no-class-composition-outside-registry rejects class strings assembled at runtime", () => {
  tester.run("no-class-composition-outside-registry", noClassCompositionOutsideRegistry, {
    valid: [
      { filename: BLOCK, code: "export const Example = () => <Tree contract=\"card\" />" },
      { filename: BLOCK, code: "export const Example = ({ tone }) => <Chip tone={tone} />" },
      { filename: REGISTRY, code: "const join = (a, b) => cn(a, b)" },
    ],
    invalid: [
      {
        filename: BLOCK,
        code: "export const Example = ({ isActive }) => <Row className={cn(\"row\", isActive && \"on\")} />",
        errors: [{ messageId: "composer", data: { name: "cn" } }],
      },
      {
        filename: BLOCK,
        code: "export const Example = ({ tone }) => <Row className={`row ${tone}`} />",
        errors: [{ messageId: "interpolated" }],
      },
      {
        filename: BLOCK,
        code: "export const Example = ({ tone }) => <Row className={\"row \" + tone} />",
        errors: [{ messageId: "interpolated" }],
      },
    ],
  })
})

test("no-hand-written-registry-attrs keeps the markers on the frame that earns them", () => {
  tester.run("no-hand-written-registry-attrs", noHandWrittenRegistryAttrs, {
    valid: [
      {
        filename: "D:/repo/src/components/branches/Tree/index.tsx",
        code: "export const Tree = ({ spec, name }) => <div data-node={name} data-why={spec.why} />",
      },
      { filename: BLOCK, code: "export const Example = () => <Row data-testid=\"row\" />" },
    ],
    invalid: [
      {
        filename: BLOCK,
        code: "export const Example = () => <Row data-node=\"content-row\" />",
        errors: [{ messageId: "marker", data: { attr: "data-node" } }],
      },
      {
        filename: "D:\\repo\\src\\components\\pages\\HomePage\\component.tsx",
        code: "export const HomePage = () => <Row data-why=\"because\" />",
        errors: [{ messageId: "marker", data: { attr: "data-why" } }],
      },
    ],
  })
})

test("no-unregistered-tree-key answers an invented key with the keys that exist", () => {
  tester.run("no-unregistered-tree-key", noUnregisteredTreeKey, {
    valid: [
      {
        filename: inRepo("src/components/blocks/example/Example/index.tsx"),
        code: "export const Example = () => <Tree contract=\"title-with-baseline-fact\" />",
      },
      {
        filename: inRepo("src/components/blocks/example/Example/index.tsx"),
        code: "export const Example = ({ name }) => <Tree contract={name} />",
      },
      {
        filename: inRepo("src/components/blocks/example/Example/index.tsx"),
        code: "const spec = contractSpec(\"empty-notice-card\")",
      },
    ],
    invalid: [
      {
        filename: inRepo("src/components/blocks/example/Example/index.tsx"),
        code: "export const Example = () => <Tree contract=\"content-row\" />",
        errors: [{ messageId: "unknown" }],
      },
      {
        filename: inRepo("src/components/pages/HomePage/component.tsx"),
        code: "const spec = contractSpec(\"hero-band\")",
        errors: [{ messageId: "unknown" }],
      },
    ],
  })
})


test("registry-explain-is-a-reason rejects an explain that only says the key again", () => {
  tester.run("registry-explain-is-a-reason", registryExplainIsAReason, {
    valid: [
      {
        filename: REGISTRY,
        code: "export const CONTRACTS = { \"content-row\": { roles: [\"field\", \"action\"], why: \"The control acts on the input beside it, so the two must read as one unit that nothing else can fall between.\" } }",
      },
      {
        // Outside the registry there is no entry to explain.
        filename: BLOCK,
        code: "const meta = { why: \"short\" }",
      },
    ],
    invalid: [
      {
        filename: REGISTRY,
        code: "export const CONTRACTS = { \"content-row\": { why: \"row of controls\" } }",
        errors: [{ messageId: "tooShort", data: { key: "content-row" } }],
      },
      {
        filename: REGISTRY,
        code: "export const CONTRACTS = { \"content-row\": { why: \"content row content row content row content row content row content row\" } }",
        errors: [{ messageId: "restates", data: { key: "content-row" } }],
      },
    ],
  })
})
