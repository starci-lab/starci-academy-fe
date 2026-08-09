/**
 * Regression tests for the two rules that govern the registry FOLDER.
 *
 *   node --test plugins/eslint/registry-folder.test.mjs
 *
 * The negative controls matter more here than the positive ones. Both rules exist to catch a
 * mistake that leaves the type checker perfectly happy - a value import that inverts the tier
 * order, and a ceiling quietly raised or deleted - so a rule that stopped firing would look
 * exactly like a clean tree. Each `invalid` case below is the shape of that silence.
 */
import test from "node:test"
import { RuleTester } from "eslint"
import tsParser from "@typescript-eslint/parser"
import { contractsTypeImportsOnly, shapesVocabularyCeiling } from "./registry-folder.mjs"

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

const CHAIN = "D:/repo/src/components/contracts/chains/dashboard.ts"
const CHAIN_TWIN = "D:/repo/src/components/contracts/chains/dashboard.test.ts"
const SHAPES = "D:/repo/src/components/contracts/shapes.ts"
const BLOCK = "D:/repo/src/components/blocks/dashboard/IdentityStats/component.tsx"

test("contracts-type-imports-only keeps the registry's upward references erasable", () => {
  tester.run("contracts-type-imports-only", contractsTypeImportsOnly, {
    valid: [
      {
        // The whole point of the folder: a chain NAMES a block, as a type.
        filename: CHAIN,
        code: "import type { IdentityStatsProps } from \"@/components/blocks/dashboard/IdentityStats/component\"\nexport type C = IdentityStatsProps",
      },
      {
        // Inline type specifiers are erased just the same.
        filename: CHAIN,
        code: "import { type IdentityStatsProps } from \"@/components/blocks/dashboard/IdentityStats/component\"\nexport type C = IdentityStatsProps",
      },
      {
        // A package is not a project module; React's own type is how a slot is spelled.
        filename: CHAIN,
        code: "import type { ComponentType } from \"react\"\nexport type C = ComponentType<{ a: string }>",
      },
      {
        // A twin builds the mistake on purpose - proving a chain REFUSES a component means
        // holding that component as a value.
        filename: CHAIN_TWIN,
        code: "import { _IdentityStats } from \"@/components/blocks/dashboard/IdentityStats/component\"\nexport const x = _IdentityStats",
      },
      {
        // Outside the registry folder a value import is ordinary code.
        filename: BLOCK,
        code: "import { Tree } from \"@/components/frames/Tree\"\nexport const x = Tree",
      },
    ],
    invalid: [
      {
        filename: CHAIN,
        code: "import { _IdentityStats } from \"@/components/blocks/dashboard/IdentityStats/component\"\nexport const x = _IdentityStats",
        errors: [{ messageId: "valueImport" }],
      },
      {
        // A relative value import is the same inversion wearing a shorter path.
        filename: SHAPES,
        code: "import { contractSpec } from \"./chains/dashboard\"\nexport const x = contractSpec",
        errors: [{ messageId: "valueImport" }],
      },
      {
        filename: CHAIN,
        code: "import \"@/components/blocks/dashboard/IdentityStats/component\"",
        errors: [{ messageId: "sideEffect" }],
      },
      {
        // A mixed import is only half erased, and the half that is not is the problem.
        filename: CHAIN,
        code: "import Default, { type Props } from \"@/components/blocks/dashboard/IdentityStats/component\"\nexport const x = Default",
        errors: [{ messageId: "valueImport" }],
      },
    ],
  })
})

test("shapes-vocabulary-ceiling caps shapes and leaves chains alone", () => {
  tester.run("shapes-vocabulary-ceiling", shapesVocabularyCeiling, {
    valid: [
      {
        filename: SHAPES,
        code: "export const CONTRACT_CEILING = 16\nexport const CONTRACTS = { a: {}, b: {} } as const",
      },
      {
        // A lower ceiling is always allowed; the hard limit is a maximum, not a target.
        filename: SHAPES,
        code: "export const CONTRACT_CEILING = 4\nexport const CONTRACTS = { a: {}, b: {} } as const",
      },
      {
        // CHAINS ARE NOT SUBJECT TO THE CEILING. This is the case that keeps the asymmetry a
        // decision rather than an oversight: a chain module may hold as many entries as there
        // are compositions, and this rule must stay silent about it.
        filename: CHAIN,
        code: "export const CONTRACTS = { a: {}, b: {}, c: {}, d: {}, e: {}, f: {}, g: {}, h: {}, i: {}, j: {}, k: {}, l: {}, m: {}, n: {}, o: {}, p: {}, q: {}, r: {} } as const",
      },
      {
        // The role vocabulary declares no keys, so there is nothing here to count.
        filename: "D:/repo/src/components/contracts/roles.ts",
        code: "export type ContractRole = \"body\"",
      },
      {
        // Outside the registry entirely.
        filename: BLOCK,
        code: "export const CONTRACTS = { a: {}, b: {}, c: {} }",
      },
    ],
    invalid: [
      {
        filename: SHAPES,
        code: "export const CONTRACT_CEILING = 2\nexport const CONTRACTS = { a: {}, b: {}, c: {} } as const",
        errors: [{ messageId: "tooMany", data: { count: 3, ceiling: 2 } }],
      },
      {
        // Deleting the constant is the obvious way to make a ceiling stop failing.
        filename: SHAPES,
        code: "export const CONTRACTS = { a: {}, b: {} } as const",
        errors: [{ messageId: "missingCeiling" }],
      },
      {
        // Raising it past the hard limit is the second-most obvious way.
        filename: SHAPES,
        code: "export const CONTRACT_CEILING = 99\nexport const CONTRACTS = { a: {}, b: {} } as const",
        errors: [{ messageId: "ceilingRaised", data: { ceiling: 99, hard: 23 } }],
      },
    ],
  })
})
