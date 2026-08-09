/**
 * Tests for structural host ownership.
 *
 *   node --test plugins/eslint/structural-hosts.test.mjs
 */
import assert from "node:assert/strict"
import test from "node:test"
import { RuleTester } from "eslint"
import tsParser from "@typescript-eslint/parser"
import { isGovernedFile, noStructuralHostOutsideRegistryFrame } from "./structural-hosts.mjs"

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

test("isGovernedFile covers product source and exempts the frame and the twin tests", () => {
  assert.equal(isGovernedFile("D:/repo/src/components/blocks/example/Example/index.tsx"), true)
  assert.equal(isGovernedFile("D:\\repo\\src\\app\\dashboard\\page.tsx"), true)
  assert.equal(isGovernedFile("D:/repo/src/components/frames/Tree/index.tsx"), false)
  assert.equal(isGovernedFile("D:/repo/src/components/blocks/example/Example/index.test.tsx"), false)
  assert.equal(isGovernedFile("D:/repo/plugins/eslint/index.mjs"), false)
})

test("no-structural-host-outside-registry-frame sends a bare div back to the registry", () => {
  tester.run("no-structural-host-outside-registry-frame", noStructuralHostOutsideRegistryFrame, {
    valid: [
      {
        filename: "D:/repo/src/components/blocks/example/Example/index.tsx",
        code: "export const Example = () => <Tree name=\"card\" slots={slots} />",
      },
      {
        // Leaves are not structure: an atom still renders its own text and controls.
        filename: "D:/repo/src/components/atoms/display/Badge/index.tsx",
        code: "export const Badge = ({ label }) => <span>{label}</span>",
      },
      {
        // The one frame that turns a key into a real element.
        filename: "D:/repo/src/components/frames/Tree/index.tsx",
        code: "export const Tree = ({ spec }) => <div className={spec.classes} />",
      },
      {
        filename: "D:/repo/src/app/layout.tsx",
        code: "export const RootLayout = ({ children }) => <html><body>{children}</body></html>",
      },
    ],
    invalid: [
      {
        filename: "D:/repo/src/components/blocks/example/Example/index.tsx",
        code: "export const Example = () => <div><Row /></div>",
        errors: [{ messageId: "host", data: { tag: "div" } }],
      },
      {
        filename: "D:\\repo\\src\\components\\pages\\HomePage\\component.tsx",
        code: "export const HomePage = () => <section><Body /></section>",
        errors: [{ messageId: "host", data: { tag: "section" } }],
      },
      {
        filename: "D:/repo/src/app/dashboard/page.tsx",
        code: "export const Page = () => <main><Body /></main>",
        errors: [{ messageId: "host", data: { tag: "main" } }],
      },
    ],
  })
})
