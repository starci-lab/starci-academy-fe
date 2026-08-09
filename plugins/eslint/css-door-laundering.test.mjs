/** Regression tests for CSS-door type-laundering enforcement. */
import test from "node:test"
import { RuleTester } from "eslint"
import tsParser from "@typescript-eslint/parser"
import { noCssDoorTypeLaundering } from "./css-door-laundering.mjs"

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

test("no-css-door-type-laundering rejects hiding a door behind a utility type", () => {
  tester.run("no-css-door-type-laundering", noCssDoorTypeLaundering, {
    valid: [
      {
        filename: "D:/repo/src/components/layouts/InnerLayout/component.tsx",
        code: `
          import type { TreeSlot } from "@/components/classNames"
          export interface InnerLayoutProps {
            nav: TreeSlot
            body: TreeSlot
            showFooter: boolean
          }
        `,
      },
      {
        filename: "D:/repo/src/components/layouts/InnerLayout/component.tsx",
        code: `
          type Keys = "id" | "label"
          export type Row = Pick<{ id: string; label: string; onPress: () => void }, Keys>
        `,
      },
      {
        // Tooling is out of scope; this rule reads product source only.
        filename: "D:/repo/plugins/eslint/index.mjs",
        code: "const x = 1",
      },
    ],
    invalid: [
      {
        filename: "D:/repo/src/components/atoms/forms/Switch/index.tsx",
        code: `
          import type { ComponentProps } from "react"
          export type SwitchProps = Omit<ComponentProps<"button">, "className" | "classNames">
        `,
        errors: [{ messageId: "utilityHide" }],
      },
      {
        filename: "D:/repo/src/components/pages/HomePage/index.tsx",
        code: "type Safe = Omit<{ className?: string; label: string }, \"className\">",
        errors: [{ messageId: "utilityHide" }],
      },
      {
        filename: "D:\\repo\\src\\components\\blocks\\example\\Example.tsx",
        code: "type Safe = Omit<{ classNames?: string[]; label: string }, \"classNames\">",
        errors: [{ messageId: "utilityHide" }],
      },
      {
        filename: "D:/repo/src/components/blocks/example/Example.tsx",
        code: "export interface ExampleProps extends Omit<RowProps, \"className\"> { tone: string }",
        errors: [{ messageId: "utilityHide" }],
      },
    ],
  })
})
