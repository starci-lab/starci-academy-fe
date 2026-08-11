import test from "node:test"
import { RuleTester } from "eslint"
import tsParser from "@typescript-eslint/parser"
import {
  fieldInputUsesSecondaryVariant,
  modalShellPassesContentDirectly,
  noSurfaceBranchInOverlay,
} from "./surface-policy.mjs"

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

test("ModalShell leaves its uninterpreted interior direct", () => {
  tester.run("modal-shell-passes-content-directly", modalShellPassesContentDirectly, {
    valid: [{
      filename: "D:/repo/src/components/shells/ModalShell/index.tsx",
      code: "export const S = ({ children }) => <Modal.Dialog><Modal.CloseTrigger />{children}</Modal.Dialog>",
    }],
    invalid: [{
      filename: "D:/repo/src/components/shells/ModalShell/index.tsx",
      code: "export const S = ({ children }) => <Modal.Dialog><Modal.Body>{children}</Modal.Body></Modal.Dialog>",
      errors: [{ messageId: "body" }],
    }],
  })
})

test("Field uses the secondary variant inside a bounded surface", () => {
  tester.run("field-input-uses-secondary-variant", fieldInputUsesSecondaryVariant, {
    valid: [{
      filename: "D:/repo/src/components/leaves/Field/index.tsx",
      code: "import { Input as HeroInput } from '@heroui/react'; export const Field = () => <HeroInput variant='secondary' />",
    }],
    invalid: [
      {
        filename: "D:/repo/src/components/leaves/Field/index.tsx",
        code: "import { Input as HeroInput } from '@heroui/react'; export const Field = () => <HeroInput />",
        errors: [{ messageId: "variant" }],
      },
      {
        filename: "D:/repo/src/components/leaves/Field/index.tsx",
        code: "import { Input } from '@heroui/react'; export const Field = () => <Input variant='primary' />",
        errors: [{ messageId: "variant" }],
      },
    ],
  })
})

test("an overlay does not draw a second named surface", () => {
  tester.run("no-surface-branch-in-overlay", noSurfaceBranchInOverlay, {
    valid: [{
      filename: "D:/repo/src/components/overlays/auth/SignInOverlay/component.tsx",
      code: "import { ModalShell } from '@/components/shells/ModalShell'",
    }],
    invalid: [{
      filename: "D:/repo/src/components/overlays/auth/SignInOverlay/component.tsx",
      code: "import { SurfaceCard } from '@/components/branches/SurfaceCard'",
      errors: [{ messageId: "nested" }],
    }],
  })
})
