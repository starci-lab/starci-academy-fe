/**
 * Tests for structural host ownership.
 *
 *   node --test plugins/eslint/structural-hosts.test.mjs
 */
import assert from "node:assert/strict"
import test from "node:test"
import { RuleTester } from "eslint"
import tsParser from "@typescript-eslint/parser"
import {
  isGovernedFile,
  isHeadingGovernedFile,
  noHeadingElementOutsideHeadingAtom,
  noStructuralHostOutsideRegistryFrame,
} from "./structural-hosts.mjs"

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
  assert.equal(isGovernedFile("D:/repo/src/components/branches/Tree/index.tsx"), false)
  assert.equal(isGovernedFile("D:/repo/src/components/blocks/example/Example/index.test.tsx"), false)
  assert.equal(isGovernedFile("D:/repo/plugins/eslint/index.mjs"), false)
})

test("no-structural-host-outside-registry-frame sends a bare div back to the registry", () => {
  tester.run("no-structural-host-outside-registry-frame", noStructuralHostOutsideRegistryFrame, {
    valid: [
      {
        filename: "D:/repo/src/components/blocks/example/Example/index.tsx",
        code: "export const Example = () => <Tree contract=\"card\" slots={slots} />",
      },
      {
        // Leaves are not structure: an atom still renders its own text and controls.
        filename: "D:/repo/src/components/leaves/display/Badge/index.tsx",
        code: "export const Badge = ({ label }) => <span>{label}</span>",
      },
      {
        // The one frame that turns a key into a real element.
        filename: "D:/repo/src/components/branches/Tree/index.tsx",
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

test("isHeadingGovernedFile exempts the atom that owns headings, and nothing else", () => {
  assert.equal(isHeadingGovernedFile("D:/repo/src/components/blocks/example/Example/component.tsx"), true)
  assert.equal(isHeadingGovernedFile("D:\\repo\\src\\components\\pages\\HomePage\\component.tsx"), true)
  assert.equal(isHeadingGovernedFile("D:/repo/src/components/leaves/Heading/index.tsx"), false)
  // The registry frame is exempt from the HOST rule because it draws hosts from a key - but
  // no key names a heading, so it has no business writing one by hand either.
  assert.equal(isHeadingGovernedFile("D:/repo/src/components/branches/Tree/index.tsx"), true)
  assert.equal(isHeadingGovernedFile("D:/repo/src/components/blocks/example/Example/component.test.tsx"), false)
  assert.equal(isHeadingGovernedFile("D:/repo/plugins/eslint/index.mjs"), false)
})

test("no-heading-element-outside-heading-atom sends a bare h2 back to the atom", () => {
  tester.run("no-heading-element-outside-heading-atom", noHeadingElementOutsideHeadingAtom, {
    valid: [
      {
        filename: "D:/repo/src/components/blocks/example/Example/component.tsx",
        code: "export const Example = ({ title }) => <Heading level={2}>{title}</Heading>",
      },
      {
        // The atom itself is the one file that turns a level into a tag.
        filename: "D:/repo/src/components/leaves/Heading/index.tsx",
        code: "export const Heading = ({ children }) => <h1>{children}</h1>",
      },
      {
        // A leaf that is not a heading is somebody else's rule.
        filename: "D:/repo/src/components/blocks/example/Example/component.tsx",
        code: "export const Example = ({ label }) => <span>{label}</span>",
      },
      {
        // The twin tests build fixture markup by hand.
        filename: "D:/repo/src/components/pages/HomePage/component.test.tsx",
        code: "export const Fixture = () => <h2>Title</h2>",
      },
    ],
    invalid: [
      {
        filename: "D:/repo/src/components/pages/DashboardPage/component.tsx",
        code: "export const Page = ({ title }) => <h1>{title}</h1>",
        errors: [{ messageId: "heading", data: { tag: "h1", level: 1 } }],
      },
      {
        filename: "D:\\repo\\src\\components\\blocks\\dashboard\\StreakStrip\\component.tsx",
        code: "export const Strip = ({ title }) => <h2>{title}</h2>",
        errors: [{ messageId: "heading", data: { tag: "h2", level: 2 } }],
      },
      {
        // The registry frame draws hosts from a key, but never a heading.
        filename: "D:/repo/src/components/branches/Tree/index.tsx",
        code: "export const Tree = ({ title }) => <h3>{title}</h3>",
        errors: [{ messageId: "heading", data: { tag: "h3", level: 3 } }],
      },
      {
        // Past level four the answer is not a different level, it is a flatter page.
        filename: "D:/repo/src/components/blocks/example/Example/component.tsx",
        code: "export const Example = ({ title }) => <h5>{title}</h5>",
        errors: [{ messageId: "tooDeep", data: { tag: "h5", deepest: 4 } }],
      },
    ],
  })
})
