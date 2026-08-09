/**
 * Focused tests for starci-fe authoring rules introduced in the ESLint burn-down.
 *
 *   node --test plugins/eslint/authoring.test.mjs
 */
import assert from "node:assert/strict"
import test from "node:test"
import { RuleTester } from "eslint"
import tsParser from "@typescript-eslint/parser"
import {
  isContentAllowlisted,
  noEmojiInSource,
  noInlineParameterType,
  noVietnameseInSourceAuthoring,
} from "./authoring.mjs"

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

test("no-inline-parameter-type rejects inline destructuring types", () => {
  tester.run("no-inline-parameter-type", noInlineParameterType, {
    valid: [
      { code: "type Props = { value: string }\nconst f = ({ value }: Props) => value" },
      { code: "interface Props { value: string }\nconst f = ({ value }: Props) => value" },
      { code: "const f = ({ value }) => value" },
      { code: "const f = (value: string) => value" },
      { code: "const f = (props: { value: string }) => props.value" },
    ],
    invalid: [
      {
        code: "const f = ({ value }: { value: string }) => value",
        errors: [{ messageId: "inline" }],
      },
      {
        code: "function g({ value }: { value: number }) { return value }",
        errors: [{ messageId: "inline" }],
      },
    ],
  })
})

test("no-emoji-in-source rejects emoji in product source", () => {
  tester.run("no-emoji-in-source", noEmojiInSource, {
    valid: [
      { code: "const label = \"OK\"" },
      { code: "// plain comment" },
    ],
    invalid: [
      {
        code: "const label = \"🔥\"",
        errors: [{ messageId: "emoji" }],
      },
      {
        code: "// TODO 🚀 ship it",
        errors: [{ messageId: "emoji" }],
      },
    ],
  })
})

test("no-vietnamese-in-source-authoring rejects Vietnamese in product source", () => {
  tester.run("no-vietnamese-in-source-authoring", noVietnameseInSourceAuthoring, {
    valid: [
      { code: "// English only" },
      { code: "const label = \"Tiếng Việt\"" },
      { code: "const re = /đ/ // vn-ok: slug transliteration" },
    ],
    invalid: [
      {
        code: "// khong duoc — wait: không được viết tiếng Việt ở đây",
        errors: [{ messageId: "vietnamese" }],
      },
      {
        code: "const msg = \"Xin chào\"",
        errors: [{ messageId: "vietnamese" }],
      },
    ],
  })
})

test("content allowlist covers locale dictionaries and fixtures", () => {
  assert.equal(isContentAllowlisted("D:/repo/src/messages/en.json"), true)
  assert.equal(isContentAllowlisted("D:\\repo\\src\\messages\\vi.json"), true)
  assert.equal(isContentAllowlisted("/repo/src/foo.fixture.ts"), true)
  assert.equal(isContentAllowlisted("/repo/src/foo.test.tsx"), true)
  assert.equal(isContentAllowlisted("/repo/src/resources/copy/vi.ts"), true)
  assert.equal(isContentAllowlisted("/repo/src/components/atoms/X/index.tsx"), false)
  assert.equal(isContentAllowlisted("/repo/src/components/classNames/shapes.ts"), false)
})

test("exports stay English-only in meta messages", () => {
  for (const rule of [noInlineParameterType, noEmojiInSource, noVietnameseInSourceAuthoring]) {
    const blob = JSON.stringify(rule.meta)
    assert.equal(/[À-ỹĂăĐđ]/.test(blob), false, "meta must not contain Vietnamese letters")
    assert.equal(/\p{Extended_Pictographic}/u.test(blob), false, "meta must not contain emoji")
    // hasEmoji helper is the runtime detector; keep meta free of pictographs either way.
  }
})
