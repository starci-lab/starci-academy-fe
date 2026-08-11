import test from "node:test"
import { RuleTester } from "eslint"
import tsParser from "@typescript-eslint/parser"
import {
  accountControlOwnsDropdown,
  authOverlayOwnsSingleContentHost,
  fieldInputUsesSecondaryVariant,
  fieldLabelIsTextOnly,
  modalShellOwnsScrollBody,
  noSurfaceBranchInOverlay,
  textLinkUsesHeroLink,
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

test("TextLink delegates hover and press behavior to HeroUI Link", () => {
  tester.run("text-link-uses-hero-link", textLinkUsesHeroLink, {
    valid: [{
      filename: "D:/repo/src/components/leaves/TextLink/index.tsx",
      code: "import { Link as HeroLink } from '@heroui/react'; export const TextLink = ({ label, press }) => <HeroLink onPress={press}>{label}</HeroLink>",
    }],
    invalid: [{
      filename: "D:/repo/src/components/leaves/TextLink/index.tsx",
      code: "export const TextLink = ({ label }) => <button className='hover:underline'>{label}</button>",
      errors: [{ messageId: "missing" }, { messageId: "handmade" }, { messageId: "handmade" }],
    }],
  })
})

test("the navbar account control opens a HeroUI dropdown before auth", () => {
  tester.run("account-control-owns-dropdown", accountControlOwnsDropdown, {
    valid: [
      {
        filename: "D:/repo/src/components/leaves/AccountMenu/index.tsx",
        code: "import { Dropdown } from '@heroui/react'; export const AccountMenu = () => <Dropdown />",
      },
      {
        filename: "D:/repo/src/components/layouts/ShellNav/component.tsx",
        code: "import { AccountMenu } from '@/components/leaves/AccountMenu'; export const ShellNav = () => <AccountMenu />",
      },
    ],
    invalid: [
      {
        filename: "D:/repo/src/components/leaves/AccountMenu/index.tsx",
        code: "export const AccountMenu = () => <div />",
        errors: [{ messageId: "dropdown" }],
      },
      {
        filename: "D:/repo/src/components/layouts/ShellNav/component.tsx",
        code: "export const ShellNav = ({ openSignIn }) => <IconButton props={{ icon: 'account' }} on={{ press: openSignIn }} />",
        errors: [{ messageId: "menu" }, { messageId: "direct" }],
      },
    ],
  })
})

test("the auth overlay has one zero-inset content host", () => {
  tester.run("auth-overlay-owns-single-content-host", authOverlayOwnsSingleContentHost, {
    valid: [
      {
        filename: "D:/repo/src/components/overlays/auth/SignInOverlay/component.tsx",
        code: "import { ContractContent } from '@/components/branches/Tree'; export const Overlay = ({ render }) => <ContractContent contract={render.meta.contract} render={render} />",
      },
      {
        filename: "D:/repo/src/components/contracts/index.ts",
        code: "const C = { 'centred-page-column': { classes: ['flex', 'gap-6'] } }",
      },
    ],
    invalid: [
      {
        filename: "D:/repo/src/components/overlays/auth/SignInOverlay/component.tsx",
        code: "import { Tree } from '@/components/branches/Tree'; export const Overlay = ({ render }) => <Tree contract={render.meta.contract} render={render} />",
        errors: [{ messageId: "missing" }, { messageId: "duplicate" }],
      },
      {
        filename: "D:/repo/src/components/contracts/index.ts",
        code: "const C = { 'centred-page-column': { classes: ['flex', 'py-6'] } }",
        errors: [{ messageId: "inset" }],
      },
    ],
  })
})
