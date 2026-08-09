/**
 * Tests for registry slot integrity.
 *
 *   node --test plugins/eslint/slots.test.mjs
 */
import test from "node:test"
import { RuleTester } from "eslint"
import tsParser from "@typescript-eslint/parser"
import { noFragmentSlot } from "./slots.mjs"

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

test("no-fragment-slot rejects a slot that smuggles a second child", () => {
  tester.run("no-fragment-slot", noFragmentSlot, {
    valid: [
      {
        code: "const View = () => <Tree name=\"content-row\" slots={{ field: Field, action: Action }} />",
      },
      {
        code: "const View = () => <Tree name=\"content-row\" slots={{ field: () => <Input />, action: () => <Button /> }} />",
      },
      {
        // One child inside a fragment is still one child.
        code: "const View = () => <Tree name=\"stat\" slots={{ meta: () => <><Label /></>, body: Body }} />",
      },
      {
        // The honest answer: the second child belongs to a nested key.
        code: "const View = () => <Tree name=\"card\" slots={{ heading: H, body: () => <Tree name=\"content-row\" slots={{ field: F, action: A }} />, footer: Foot }} />",
      },
      {
        // Documented gap: a `React.Fragment` member element is not a JSXFragment node.
        code: "const View = () => <Tree name=\"stat\" slots={{ meta: () => <React.Fragment><A /><B /></React.Fragment>, body: Body }} />",
      },
    ],
    invalid: [
      {
        code: "const View = () => <Tree name=\"stat\" slots={{ meta: () => <><Label /><Hint /></>, body: Body }} />",
        errors: [{ messageId: "fragment", data: { role: "meta" } }],
      },
      {
        code: "const View = () => <Tree name=\"stat\" slots={{ meta: () => { return <><Label /><Hint /></> }, body: Body }} />",
        errors: [{ messageId: "fragment", data: { role: "meta" } }],
      },
      {
        code: "const pair = <><Label /><Hint /></>; const View = () => <Tree name=\"stat\" slots={{ meta: () => pair, body: Body }} />",
        errors: [{ messageId: "fragment", data: { role: "meta" } }],
      },
      {
        code: "const pair = <><Label /><Hint /></>; const View = () => <Tree name=\"stat\" slots={{ meta: pair, body: Body }} />",
        errors: [{ messageId: "fragment", data: { role: "meta" } }],
      },
    ],
  })
})
