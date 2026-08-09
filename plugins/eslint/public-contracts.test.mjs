/** Focused tests for public house-component CSS-door enforcement. */
import test from "node:test"
import { RuleTester } from "eslint"
import tsParser from "@typescript-eslint/parser"
import { noPublicClassNameProp } from "./public-contracts.mjs"

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

test("no-public-classname-prop closes every public CSS door", () => {
  tester.run("no-public-classname-prop", noPublicClassNameProp, {
    valid: [
      {
        filename: "D:/repo/src/components/atoms/display/Badge/index.tsx",
        code: "type Props = { size: \"sm\" | \"md\" }\nexport const Badge = ({ size }: Props) => <span data-size={size} />",
      },
      {
        filename: "D:/repo/src/components/blocks/example/Example.tsx",
        code: "type Props = { tone: \"quiet\" | \"loud\" }\nexport const Example = ({ tone }: Props) => <Chip tone={tone} />",
      },
      {
        // The registry hands out a KEY, never a class string - that is why it can be a prop.
        filename: "D:/repo/src/components/blocks/example/Example.tsx",
        code: "import { Tree } from \"@/components/frames/Tree\"\nexport const Example = () => <Tree name=\"card\" slots={slots} />",
      },
      {
        // Outside the component tree, only the call site is enforced.
        filename: "D:/repo/src/hooks/useTheme.ts",
        code: "export const useTheme = ({ className }) => className",
      },
    ],
    invalid: [
      {
        filename: "D:/repo/src/components/atoms/display/Badge/index.tsx",
        code: "interface BadgeProps { classNames?: string[] }\nexport const Badge = ({ classNames }: BadgeProps) => <span data-x={classNames} />",
        errors: [
          { messageId: "declaration" },
          { messageId: "declaration" },
        ],
      },
      {
        filename: "D:/repo/src/components/pages/ExamplePage/index.tsx",
        code: "import { Badge } from \"@/components/atoms/display/Badge\"\nexport const BadgeRow = () => <Badge classNames={[\"shrink-0\"]} />",
        errors: [{ messageId: "usage" }],
      },
      {
        // The retired `frames/Box` foreign-mount hatch is not a boundary here.
        filename: "D:/repo/src/components/frames/Box/index.tsx",
        code: "export const Box = ({ className, children }) => <span data-x={className}>{children}</span>",
        errors: [{ messageId: "declaration" }],
      },
      {
        filename: "D:\\repo\\src\\components\\composites\\layout\\Shell\\index.tsx",
        code: "import { Drawer } from \"@/components/atoms/overlay/Drawer\"\nexport const Shell = () => <Drawer className=\"sm:max-w-md\" />",
        errors: [{ messageId: "usage" }],
      },
      {
        filename: "D:/repo/src/components/blocks/example/Example.tsx",
        code: "export interface ExampleProps extends WithClassNames<\"root\"> { tone: string }",
        errors: [{ messageId: "withClassNames" }],
      },
    ],
  })
})
