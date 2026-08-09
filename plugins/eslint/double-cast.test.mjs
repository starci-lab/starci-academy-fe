/**
 * Tests for the double cast.
 *
 *   node --test plugins/eslint/double-cast.test.mjs
 */
import assert from "node:assert/strict"
import test from "node:test"
import { RuleTester } from "eslint"
import tsParser from "@typescript-eslint/parser"
import { isCastGovernedFile, noDoubleCast } from "./double-cast.mjs"

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

test("isCastGovernedFile covers product source and exempts the twin tests", () => {
  assert.equal(isCastGovernedFile("D:/repo/src/components/blocks/example/Example/index.tsx"), true)
  assert.equal(isCastGovernedFile("D:\\repo\\src\\hooks\\swr\\useQueryThingSwr.ts"), true)
  assert.equal(isCastGovernedFile("D:/repo/src/components/atoms/Avatar/index.test.tsx"), false)
  assert.equal(isCastGovernedFile("D:/repo/src/modules/api/graphql/clients/links/bearer.test.ts"), false)
  assert.equal(isCastGovernedFile("D:/repo/plugins/eslint/index.mjs"), false)
})

test("no-double-cast rejects a type erased through unknown, and spares the tests that need it", () => {
  tester.run("no-double-cast", noDoubleCast, {
    valid: [
      {
        // A single `as` still has to overlap, so it is an argument rather than a mute button.
        filename: "D:/repo/src/components/blocks/example/Example/index.tsx",
        code: "const rows = payload as Array<Row>",
      },
      {
        filename: "D:/repo/src/components/blocks/example/Example/index.tsx",
        code: "const weekly = useQueryMyWeeklyStatsSwr()",
      },
      {
        // The twin test builds props the API refuses, on purpose, to prove it refuses them.
        filename: "D:/repo/src/components/atoms/Avatar/index.test.tsx",
        code: "const backDoor = { className: \"back-door\" } as unknown as AvatarProps",
      },
      {
        filename: "D:/repo/plugins/eslint/index.mjs",
        code: "const anything = value as unknown as Target",
      },
    ],
    invalid: [
      {
        filename: "D:/repo/src/components/blocks/dashboard/StreakStrip/index.tsx",
        code: "const weekly = useQueryMyWeeklyStatsSwr() as unknown as WeeklyStatsLeaf",
        errors: [{ messageId: "doubleCast", data: { erased: "unknown", target: "WeeklyStatsLeaf" } }],
      },
      {
        // `any` erases exactly as much as `unknown` does; the hole is the same hole.
        filename: "D:\\repo\\src\\components\\frames\\Tree\\index.tsx",
        code: "const byRole = slots as any as Partial<Record<ContractRole, ContractSlot>>",
        errors: [
          {
            messageId: "doubleCast",
            data: { erased: "any", target: "Partial<Record<ContractRole, ContractSlot>>" },
          },
        ],
      },
      {
        filename: "D:/repo/src/hooks/swr/useQueryThingSwr.ts",
        code: "export const useThing = () => raw as unknown as Thing",
        errors: [{ messageId: "doubleCast" }],
      },
    ],
  })
})
