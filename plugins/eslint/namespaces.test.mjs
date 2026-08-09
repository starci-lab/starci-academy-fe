/** Focused tests for the direct-named-export runtime namespace rule. */
import test from "node:test"
import { RuleTester } from "eslint"
import tsParser from "@typescript-eslint/parser"
import { noRuntimeNamespace } from "./namespaces.mjs"

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

test("no-runtime-namespace requires direct named exports and usages", () => {
  tester.run("no-runtime-namespace", noRuntimeNamespace, {
    valid: [
      {
        filename: "D:/repo/src/components/atoms/buttons/ButtonGroup/index.tsx",
        code: "export const ButtonGroupRoot = () => null\nexport const ButtonGroupSeparator = () => null",
      },
      {
        filename: "D:/repo/src/components/atoms/buttons/ButtonGroup/index.tsx",
        code: "const Root = () => null\nexport { Root as ButtonGroupRoot }",
      },
      {
        filename: "D:/repo/src/components/blocks/example/Example.tsx",
        code: "const config = { Root: true, mode: \"test\" }",
      },
      {
        filename: "D:/repo/src/components/blocks/example/Example.tsx",
        code: "const view = <HeroModal.Header />",
      },
      {
        filename: "D:/repo/src/components/blocks/example/Example.tsx",
        code: "import { Modal } from \"@heroui/react\"\nconst view = <Modal.Header />",
      },
      {
        filename: "D:/repo/src/components/blocks/example/Example.tsx",
        code: "import { Modal as HeroModal } from \"@heroui/react\"\nconst view = <HeroModal.Header />",
      },
      {
        filename: "D:/repo/src/components/blocks/example/Example.tsx",
        code: "import * as HeroUI from \"@heroui/react\"\nconst { Table } = HeroUI\nconst view = <Table.Cell />",
      },
    ],
    invalid: [
      {
        filename: "D:/repo/src/components/atoms/buttons/ButtonGroup/index.tsx",
        code: "export const ButtonGroup = { Root: ButtonGroupRoot, Separator: ButtonGroupSeparator } as const",
        errors: [{ messageId: "export" }],
      },
      {
        filename: "D:/repo/src/components/blocks/example/Example.tsx",
        code: "const view = <Modal.Header />",
        errors: [{ messageId: "usage" }],
      },
      {
        filename: "D:/repo/src/components/blocks/example/Example.tsx",
        code: "const view = Select.Root",
        errors: [{ messageId: "usage" }],
      },
      {
        filename: "D:/repo/src/components/blocks/example/Example.tsx",
        code: "const view = <Modal.CloseTrigger />",
        errors: [{ messageId: "usage" }],
      },
    ],
  })
})
