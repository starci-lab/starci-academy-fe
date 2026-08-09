/**
 * Regression tests for the named-registry rules.
 *
 *   node --test plugins/eslint/registry-rules.test.mjs
 *
 * The key and role cases run against REAL paths inside this repository, so the rules read
 * the actual `src/components/classNames.tsx` rather than a copy of its vocabulary. That is
 * the point of the registry: there is one list, and even the tests do not restate it.
 */
import assert from "node:assert/strict"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import test from "node:test"
import { RuleTester } from "eslint"
import tsParser from "@typescript-eslint/parser"
import { readRegistry } from "./registry.mjs"
import {
  noClassCompositionOutsideRegistry,
  noHandWrittenRegistryAttrs,
  noLiteralStructuralClass,
  noUnknownSlotRole,
  noUnregisteredTreeKey,
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

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..")
/** A real path inside this repository, so the registry above it is the real one. */
const inRepo = (relative) => join(repoRoot, relative).replace(/\\/g, "/")

const BLOCK = "D:/repo/src/components/blocks/example/Example/index.tsx"
const REGISTRY = "D:/repo/src/components/classNames.tsx"

test("the registry parses into keys and a closed role vocabulary", () => {
  const registry = readRegistry(inRepo("src/components/blocks/example/Example/index.tsx"))
  assert.ok(registry, "expected the repository registry to be readable")
  assert.ok(registry.keys.includes("content-row"))
  assert.deepEqual(registry.rolesByKey["content-row"], ["field", "action"])
  assert.ok(registry.roles.includes("action"))
  assert.equal(registry.roles.includes("sidebar"), false)
})

test("no-literal-structural-class sends every structural node back to a registry key", () => {
  tester.run("no-literal-structural-class", noLiteralStructuralClass, {
    valid: [
      {
        filename: BLOCK,
        code: "export const Example = () => <Tree name=\"content-row\" slots={{ field: F, action: A }} />",
      },
      {
        // Appearance on a leaf is the leaf's own business; the TREE is what the registry owns.
        filename: BLOCK,
        code: "export const Example = () => <span className=\"text-sm text-muted\" />",
      },
      {
        // The registry is the one file allowed to write a class string.
        filename: REGISTRY,
        code: "export const CLASS_NAMES = { card: { classes: \"flex flex-col gap-4\" } }",
      },
      {
        // A twin test may build fixture markup by hand.
        filename: "D:/repo/src/components/blocks/example/Example/index.test.tsx",
        code: "const fixture = () => <div className=\"flex gap-2\" />",
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
      { filename: BLOCK, code: "export const Example = () => <Tree name=\"card\" slots={slots} />" },
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
        filename: "D:/repo/src/components/frames/Tree/index.tsx",
        code: "export const Tree = ({ spec, name }) => <div data-node={name} data-roles={spec.roles} data-explain={spec.explain} />",
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
        code: "export const HomePage = () => <Row data-explain=\"because\" />",
        errors: [{ messageId: "marker", data: { attr: "data-explain" } }],
      },
    ],
  })
})

test("no-unregistered-tree-key answers an invented key with the keys that exist", () => {
  tester.run("no-unregistered-tree-key", noUnregisteredTreeKey, {
    valid: [
      {
        filename: inRepo("src/components/blocks/example/Example/index.tsx"),
        code: "export const Example = () => <Tree name=\"content-row\" slots={slots} />",
      },
      {
        filename: inRepo("src/components/blocks/example/Example/index.tsx"),
        code: "export const Example = ({ name }) => <Tree name={name} slots={slots} />",
      },
      {
        filename: inRepo("src/components/blocks/example/Example/index.tsx"),
        code: "const spec = treeSpec(\"card\")",
      },
    ],
    invalid: [
      {
        filename: inRepo("src/components/blocks/example/Example/index.tsx"),
        code: "export const Example = () => <Tree name=\"content-row-a\" slots={slots} />",
        errors: [{ messageId: "unknown" }],
      },
      {
        filename: inRepo("src/components/pages/HomePage/component.tsx"),
        code: "const spec = treeSpec(\"hero-band\")",
        errors: [{ messageId: "unknown" }],
      },
    ],
  })
})

test("no-unknown-slot-role holds a tree to the roles its key declares", () => {
  tester.run("no-unknown-slot-role", noUnknownSlotRole, {
    valid: [
      {
        filename: inRepo("src/components/blocks/example/Example/index.tsx"),
        code: "export const Example = () => <Tree name=\"content-row\" slots={{ field: Field, action: Action }} />",
      },
      {
        filename: inRepo("src/components/blocks/example/Example/index.tsx"),
        code: "export const Example = () => <Tree name=\"card\" slots={{ heading: H, body: B, footer: F }} />",
      },
      {
        // A slots object built elsewhere is out of reach; TypeScript still checks it.
        filename: inRepo("src/components/blocks/example/Example/index.tsx"),
        code: "export const Example = () => <Tree name=\"card\" slots={slots} />",
      },
    ],
    invalid: [
      {
        filename: inRepo("src/components/blocks/example/Example/index.tsx"),
        code: "export const Example = () => <Tree name=\"card\" slots={{ heading: H, body: B, footer: F, sidebar: S }} />",
        errors: [{ messageId: "unknownRole" }],
      },
      {
        filename: inRepo("src/components/blocks/example/Example/index.tsx"),
        code: "export const Example = () => <Tree name=\"content-row\" slots={{ field: F, action: A, heading: H }} />",
        errors: [{ messageId: "wrongRole" }],
      },
      {
        filename: inRepo("src/components/blocks/example/Example/index.tsx"),
        code: "export const Example = () => <Tree name=\"card\" slots={{ heading: H, body: B }} />",
        errors: [{ messageId: "missingRole", data: { key: "card", role: "footer" } }],
      },
    ],
  })
})

test("registry-explain-is-a-reason rejects an explain that only says the key again", () => {
  tester.run("registry-explain-is-a-reason", registryExplainIsAReason, {
    valid: [
      {
        filename: REGISTRY,
        code: "export const CLASS_NAMES = { \"content-row\": { roles: [\"field\", \"action\"], explain: \"The control acts on the input beside it, so the two must read as one unit that nothing else can fall between.\" } }",
      },
      {
        // Outside the registry there is no entry to explain.
        filename: BLOCK,
        code: "const meta = { explain: \"short\" }",
      },
    ],
    invalid: [
      {
        filename: REGISTRY,
        code: "export const CLASS_NAMES = { \"content-row\": { explain: \"row of controls\" } }",
        errors: [{ messageId: "tooShort", data: { key: "content-row" } }],
      },
      {
        filename: REGISTRY,
        code: "export const CLASS_NAMES = { \"content-row\": { explain: \"content row content row content row content row content row content row\" } }",
        errors: [{ messageId: "restates", data: { key: "content-row" } }],
      },
    ],
  })
})
