/**
 * Positive/negative regression for the architectural rules that live in the index.mjs
 * bundle rather than in a module of their own.
 *
 *   node --test plugins/eslint/architectural-oracle.test.mjs
 */
import test from "node:test"
import { RuleTester } from "eslint"
import tsParser from "@typescript-eslint/parser"
import starciFe from "./index.mjs"

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

test("no-heroui-outside-vocabulary bans vendor imports at sentence tier only", () => {
  tester.run(
    "no-heroui-outside-vocabulary",
    starciFe.rules["no-heroui-outside-vocabulary"],
    {
      valid: [
        {
          filename: "D:/repo/src/components/atoms/buttons/Button/ButtonBase.tsx",
          code: "import { Button } from \"@heroui/react\"\nexport const ButtonBase = Button",
        },
        {
          filename: "D:/repo/src/components/frames/Tree/index.tsx",
          code: "import { Button } from \"@heroui/react\"\nexport const X = Button",
        },
        {
          filename: "D:/repo/src/hooks/useTheme.ts",
          code: "import { useTheme } from \"@heroui/react\"",
        },
        {
          filename: "D:/repo/src/components/blocks/navigation/Footer/index.tsx",
          code: "import { Tree } from \"@/components/frames/Tree\"",
        },
      ],
      invalid: [
        {
          filename: "D:/repo/src/components/blocks/navigation/Footer/index.tsx",
          code: "import { Button } from \"@heroui/react\"",
          errors: [{ messageId: "heroui" }],
        },
        {
          filename: "D:\\repo\\src\\components\\layouts\\InnerLayout\\component.tsx",
          code: "import { Navbar } from \"@heroui/react\"",
          errors: [{ messageId: "heroui" }],
        },
      ],
    },
  )
})

test("page-folder-two-files-only keeps screen folders to the two halves and their twins", () => {
  tester.run(
    "page-folder-two-files-only",
    starciFe.rules["page-folder-two-files-only"],
    {
      valid: [
        {
          filename: "D:/repo/src/components/pages/HomePage/component.tsx",
          code: "export const HomePage = () => null",
        },
        {
          filename: "D:/repo/src/components/pages/HomePage/index.tsx",
          code: "export { HomePage } from \"./component\"",
        },
        {
          filename: "D:/repo/src/components/pages/HomePage/component.test.tsx",
          code: "export const spec = 1",
        },
        {
          filename: "D:/repo/src/components/overlays/modals/Confirm/index.tsx",
          code: "export const Confirm = () => null",
        },
        {
          filename: "D:/repo/src/components/blocks/navigation/Footer/map.ts",
          code: "export const map = {}",
        },
      ],
      invalid: [
        {
          filename: "D:/repo/src/components/pages/HomePage/map.ts",
          code: "export const map = {}",
          errors: [{
            messageId: "extra",
            data: { tier: "pages", name: "HomePage", rest: "map.ts" },
          }],
        },
        {
          filename: "D:\\repo\\src\\components\\overlays\\modals\\Confirm\\SignInSection\\index.tsx",
          code: "export const SignInSection = () => null",
          errors: [{
            messageId: "extra",
            data: { tier: "overlays", name: "Confirm", rest: "SignInSection/index.tsx" },
          }],
        },
      ],
    },
  )
})

test("no-parallel-skeleton rejects hand-kept skeleton trees", () => {
  tester.run(
    "no-parallel-skeleton",
    starciFe.rules["no-parallel-skeleton"],
    {
      valid: [
        {
          filename: "D:/repo/src/components/blocks/example/Example/index.tsx",
          code: "import { Skeleton } from \"./Skeleton\"\nexport const Example = ({ isSkeleton }) => <Card isSkeleton={isSkeleton} />",
        },
        {
          filename: "D:/repo/src/components/blocks/example/Example/index.tsx",
          code: "export const Example = ({ skeletonLabel }) => <span>{skeletonLabel}</span>",
        },
      ],
      invalid: [
        {
          filename: "D:/repo/src/components/blocks/example/Example/index.tsx",
          code: "export const Example = () => <Panel skeleton={<RowSkeleton />} />",
          errors: [{ messageId: "prop" }],
        },
        {
          filename: "D:/repo/src/components/blocks/example/Example/index.tsx",
          code: "import { ExampleSkeleton } from \"./ExampleSkeleton\"",
          errors: [{ messageId: "import", data: { name: "ExampleSkeleton" } }],
        },
      ],
    },
  )
})

test("no-inline-skeleton-branch rejects different elements under isSkeleton ternaries", () => {
  tester.run(
    "no-inline-skeleton-branch",
    starciFe.rules["no-inline-skeleton-branch"],
    {
      valid: [
        {
          filename: "D:/repo/src/components/blocks/example/Example/index.tsx",
          code: "export const Example = ({ isSkeleton }) => isSkeleton ? <Card isSkeleton /> : <Card />",
        },
        {
          filename: "D:/repo/src/components/blocks/example/Example/index.tsx",
          code: "export const Example = ({ isLoading }) => isLoading ? <Spinner /> : null",
        },
        {
          filename: "D:/repo/src/components/atoms/display/Badge/index.tsx",
          code: "export const Badge = ({ isSkeleton }) => isSkeleton ? <Skeleton /> : <BadgeInner />",
        },
      ],
      invalid: [
        {
          filename: "D:/repo/src/components/blocks/example/Example/index.tsx",
          code: "export const Example = ({ isSkeleton }) => isSkeleton ? <CardSkeleton /> : <Card />",
          errors: [{ messageId: "branch" }],
        },
        {
          filename: "D:\\repo\\src\\components\\composites\\feedback\\Callout\\index.tsx",
          code: "export const Callout = ({ isPending }) => isPending ? <>...</> : <CalloutBody />",
          errors: [{ messageId: "branch" }],
        },
      ],
    },
  )
})

test("no-skeleton-twin-component rejects hand-mirrored *Skeleton folders outside primitives", () => {
  tester.run(
    "no-skeleton-twin-component",
    starciFe.rules["no-skeleton-twin-component"],
    {
      valid: [
        {
          filename: "D:/repo/src/components/blocks/skeleton/AccordionSkeleton/index.tsx",
          code: "export const AccordionSkeleton = () => null",
        },
        {
          filename: "D:/repo/src/components/atoms/display/Skeleton/index.tsx",
          code: "export const Skeleton = () => null",
        },
      ],
      invalid: [
        {
          filename: "D:/repo/src/components/blocks/example/ExampleSkeleton/index.tsx",
          code: "export const ExampleSkeleton = () => null",
          errors: [{ messageId: "twin", data: { name: "ExampleSkeleton" } }],
        },
        {
          filename: "D:\\repo\\src\\components\\composites\\feedback\\CalloutSkeleton\\index.tsx",
          code: "export const CalloutSkeleton = () => null",
          errors: [{ messageId: "twin", data: { name: "CalloutSkeleton" } }],
        },
      ],
    },
  )
})

test("token rules read the registry entry, not only the JSX literal", () => {
  tester.run(
    "no-fractional-spacing",
    starciFe.rules["no-fractional-spacing"],
    {
      valid: [
        {
          filename: "D:/repo/src/components/classNames.tsx",
          code: "export const CLASS_NAMES = { card: { classes: \"flex flex-col gap-4\" } }",
        },
      ],
      invalid: [
        {
          filename: "D:/repo/src/components/classNames.tsx",
          code: "export const CLASS_NAMES = { card: { classes: \"flex flex-col gap-1.5\" } }",
          errors: [{ messageId: "frac", data: { cls: "gap-1.5" } }],
        },
        {
          filename: "D:/repo/src/components/atoms/display/Badge/index.tsx",
          code: "export const Badge = () => <span className=\"p-2.5\" />",
          errors: [{ messageId: "frac", data: { cls: "p-2.5" } }],
        },
      ],
    },
  )

  tester.run(
    "no-arbitrary-token",
    starciFe.rules["no-arbitrary-token"],
    {
      valid: [
        {
          filename: "D:/repo/src/components/classNames.tsx",
          code: "export const CLASS_NAMES = { card: { classes: \"rounded-2xl border p-6\" } }",
        },
      ],
      invalid: [
        {
          filename: "D:/repo/src/components/classNames.tsx",
          code: "export const CLASS_NAMES = { card: { classes: \"gap-[7px]\" } }",
          errors: [{ messageId: "space", data: { cls: "gap-[7px]" } }],
        },
      ],
    },
  )
})

test("no-public-frame-css-props closes the seam the registry key already owns", () => {
  tester.run(
    "no-public-frame-css-props",
    starciFe.rules["no-public-frame-css-props"],
    {
      valid: [
        {
          filename: "D:/repo/src/components/blocks/example/Example/index.tsx",
          code: "import { Tree } from \"@/components/frames/Tree\"\nexport const Example = () => <Tree name=\"card\" slots={slots} isSkeleton />",
        },
        {
          // The frame declares the props it refuses; only callers are enforced.
          filename: "D:/repo/src/components/frames/Tree/index.tsx",
          code: "export const Tree = ({ className }) => <div className={className} />",
        },
      ],
      invalid: [
        {
          filename: "D:/repo/src/components/blocks/example/Example/index.tsx",
          code: "import { Tree } from \"@/components/frames/Tree\"\nexport const Example = () => <Tree name=\"card\" slots={slots} gap={4} />",
          errors: [{ messageId: "cssProp", data: { prop: "gap", frame: "Tree" } }],
        },
        {
          filename: "D:\\repo\\src\\components\\pages\\HomePage\\component.tsx",
          code: "import { Tree } from \"@/components/frames/Tree\"\nexport const HomePage = () => <Tree name=\"page-shell\" slots={slots} className=\"p-4\" />",
          errors: [{ messageId: "cssProp", data: { prop: "className", frame: "Tree" } }],
        },
      ],
    },
  )
})
