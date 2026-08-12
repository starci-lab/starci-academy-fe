import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { RuleTester } from "eslint"
import tsParser from "@typescript-eslint/parser"
import {
  accountControlOwnsDropdown,
  authOverlayOwnsSingleContentHost,
  checkboxKeepsCompoundAnatomy,
  inputUsesSecondaryVariant,
  fieldLabelIsTextOnly,
  modalShellOwnsScrollBody,
  noInternalStarciHref,
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

test("SurfaceListCard defeats the important generic Card inset", () => {
  const css = readFileSync(new URL("../../src/app/globals.css", import.meta.url), "utf8")

  assert.match(
    css,
    /\.card\[data-component=["']SurfaceListCardSurface["']\]\s*\{[^}]*padding:\s*0\s*!important;/s,
  )
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

test("Input uses the secondary variant inside a bounded surface", () => {
  tester.run("input-uses-secondary-variant", inputUsesSecondaryVariant, {
    valid: [{
      filename: "D:/repo/src/components/leaves/Input/index.tsx",
      code: "import { Input as HeroInput } from '@heroui/react'; export const Field = () => <HeroInput variant='secondary' />",
    }],
    invalid: [
      {
        filename: "D:/repo/src/components/leaves/Input/index.tsx",
        code: "import { Input as HeroInput } from '@heroui/react'; export const Field = () => <HeroInput />",
        errors: [{ messageId: "variant" }],
      },
      {
        filename: "D:/repo/src/components/leaves/Input/index.tsx",
        code: "import { Input } from '@heroui/react'; export const Field = () => <Input variant='primary' />",
        errors: [{ messageId: "variant" }],
      },
    ],
  })
})

test("Field does not infer decorative icons from the input kind", () => {
  tester.run("field-label-is-text-only", fieldLabelIsTextOnly, {
    valid: [
      {
        filename: "D:/repo/src/components/composites/Field/index.tsx",
        code: "import { Input } from '@heroui/react'; export const Field = ({ label }) => <label>{label}</label>",
      },
      {
        filename: "D:/repo/src/components/composites/Field/index.tsx",
        code: "import { Icon } from '@/components/leaves/Icon'; export const Field = () => <div><label>Password</label><button><Icon /></button></div>",
      },
    ],
    invalid: [{
      filename: "D:/repo/src/components/composites/Field/index.tsx",
      code: "import { Icon } from '@/components/leaves/Icon'; export const Field = () => <label>Password <Icon /></label>",
      errors: [{ messageId: "icon" }],
    }],
  })
})

test("Checkbox keeps the vendor control inside its clickable content", () => {
  tester.run("checkbox-keeps-compound-anatomy", checkboxKeepsCompoundAnatomy, {
    valid: [{
      filename: "D:/repo/src/components/leaves/Checkbox/index.tsx",
      code: "export const Checkbox = () => <HeroCheckbox><HeroCheckbox.Content><HeroCheckbox.Control><HeroCheckbox.Indicator /></HeroCheckbox.Control><span>Remember me</span></HeroCheckbox.Content></HeroCheckbox>",
    }],
    invalid: [{
      filename: "D:/repo/src/components/leaves/Checkbox/index.tsx",
      code: "export const Checkbox = () => <HeroCheckbox><HeroCheckbox.Control><HeroCheckbox.Indicator /></HeroCheckbox.Control><HeroCheckbox.Content>Remember me</HeroCheckbox.Content></HeroCheckbox>",
      errors: [{ messageId: "anatomy" }],
    }],
  })
})

test("internal StarCi navigation is routed by connected actions", () => {
  tester.run("no-internal-starci-href", noInternalStarciHref, {
    valid: [
      {
        filename: "D:/repo/src/components/leaves/Link/index.tsx",
        code: "export const Link = ({ externalHref, press }) => <HeroLink href={externalHref} onPress={press} />",
      },
      {
        filename: "D:/repo/src/components/layouts/ShellNav/index.tsx",
        code: "const routes = [{ id: 'dashboard', path: '/dashboard' }]; router.push(routes[0].path)",
      },
    ],
    invalid: [
      {
        filename: "D:/repo/src/components/layouts/ShellNav/component.tsx",
        code: "export const Nav = () => <HeroLink href='/dashboard'>Dashboard</HeroLink>",
        errors: [{ messageId: "internal" }],
      },
      {
        filename: "D:/repo/src/components/blocks/auth/AuthenticationPanel/component.tsx",
        code: "const legal = { href: 'https://academy.starci.org/vi/terms' }",
        errors: [{ messageId: "internal" }],
      },
      {
        filename: "D:/repo/src/components/layouts/Footer/component.tsx",
        code: "const legal = { externalHref: 'https://academy.starci.org/vi/privacy' }",
        errors: [{ messageId: "internal" }],
      },
      {
        filename: "D:/repo/src/components/leaves/NavLink/index.tsx",
        code: "type NavLinkData = { readonly href: string }; export const NavLink = ({ props }) => <HeroLink href={props.href} />",
        errors: [{ messageId: "leaf" }, { messageId: "leaf" }],
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
    invalid: [
      {
        filename: "D:/repo/src/components/overlays/auth/SignInOverlay/component.tsx",
        code: "import { SurfaceCard } from '@/components/branches/SurfaceCard'",
        errors: [{ messageId: "nested" }],
      },
      {
        filename: "D:/repo/src/components/overlays/auth/SignInOverlay/component.tsx",
        code: "import { SurfaceFormCard } from '@/components/branches/SurfaceFormCard'",
        errors: [{ messageId: "nested" }],
      },
    ],
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

test("the account block owns product choices while DropdownShell owns HeroUI", () => {
  tester.run("account-control-owns-dropdown", accountControlOwnsDropdown, {
    valid: [
      {
        filename: "D:/repo/src/components/shells/DropdownShell/index.tsx",
        code: "import { Dropdown } from '@heroui/react'; export const DropdownShell = () => <Dropdown />",
      },
      {
        filename: "D:/repo/src/components/blocks/auth/AccountMenu/component.tsx",
        code: "import { DropdownShell } from '@/components/shells/DropdownShell'; export const _AccountMenu = () => <DropdownShell />",
      },
      {
        filename: "D:/repo/src/components/layouts/ShellNav/component.tsx",
        code: "import { AccountMenu } from '@/components/blocks/auth/AccountMenu'; export const ShellNav = () => <AccountMenu />",
      },
    ],
    invalid: [
      {
        filename: "D:/repo/src/components/shells/DropdownShell/index.tsx",
        code: "export const DropdownShell = () => <div />",
        errors: [{ messageId: "dropdown" }],
      },
      {
        filename: "D:/repo/src/components/shells/DropdownShell/index.tsx",
        code: "import { Dropdown } from '@heroui/react'; export const DropdownShell = () => <Dropdown />; export const DropdownShellItem = Dropdown.Item",
        errors: [{ messageId: "pieces" }],
      },
      {
        filename: "D:/repo/src/components/blocks/auth/AccountMenu/component.tsx",
        code: "import { Dropdown } from '@heroui/react'; export const _AccountMenu = () => <Dropdown />",
        errors: [{ messageId: "vendor" }, { messageId: "shell" }],
      },
      {
        filename: "D:/repo/src/components/blocks/auth/AccountMenu/component.tsx",
        code: "import { DropdownShell, DropdownShellItem } from '@/components/shells/DropdownShell'; export const _AccountMenu = () => <DropdownShell><DropdownShellItem /></DropdownShell>",
        errors: [{ messageId: "pieces" }],
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
