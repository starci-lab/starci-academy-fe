import test from "node:test"
import { RuleTester } from "eslint"
import tsParser from "@typescript-eslint/parser"
import {
  fieldInputUsesSecondaryVariant,
  fieldLabelIsTextOnly,
  modalShellOwnsScrollBody,
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

test("ModalShell owns one zero-inset scroll body", () => {
  tester.run("modal-shell-owns-scroll-body", modalShellOwnsScrollBody, {
    valid: [{
      filename: "D:/repo/src/components/shells/ModalShell/index.tsx",
      code: "export const S = ({ children }) => <Modal.Dialog><Modal.Body className='p-0'>{children}</Modal.Body></Modal.Dialog>",
    }],
    invalid: [
      {
        filename: "D:/repo/src/components/shells/ModalShell/index.tsx",
        code: "export const S = ({ children }) => <Modal.Dialog>{children}</Modal.Dialog>",
        errors: [{ messageId: "missing" }],
      },
      {
        filename: "D:/repo/src/components/shells/ModalShell/index.tsx",
        code: "export const S = ({ children }) => <Modal.Dialog><Modal.Body>{children}</Modal.Body></Modal.Dialog>",
        errors: [{ messageId: "inset" }],
      },
    ],
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

test("Field does not infer decorative icons from the input kind", () => {
  tester.run("field-label-is-text-only", fieldLabelIsTextOnly, {
    valid: [{
      filename: "D:/repo/src/components/leaves/Field/index.tsx",
      code: "import { Input } from '@heroui/react'; export const Field = ({ label }) => <label>{label}</label>",
    }],
    invalid: [{
      filename: "D:/repo/src/components/leaves/Field/index.tsx",
      code: "import { Icon } from '@/components/leaves/Icon'; export const Field = () => <Icon />",
      errors: [{ messageId: "icon" }],
    }],
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
