import test from "node:test"
import { RuleTester } from "eslint"
import tsParser from "@typescript-eslint/parser"
import { heroiconsFamiliesAreClosed, noVendorIconOutsideIconLeaf } from "./icon-vocabulary.mjs"

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

const ICON = "D:/repo/src/components/leaves/Icon/index.tsx"
const RANK_MARK = "D:/repo/src/components/leaves/RankMark/index.tsx"
const BRANDS = "D:/repo/src/components/leaves/Icon/brands.tsx"
const OTHER = "D:/repo/src/components/leaves/SeeMoreLink/index.tsx"

test("only Icon and the closed RankMark artwork leaf name glyph packages", () => {
  tester.run("no-vendor-icon-outside-icon-leaf", noVendorIconOutsideIconLeaf, {
    valid: [
      { filename: ICON, code: "import { HomeIcon } from \"@heroicons/react/24/outline\"" },
      { filename: RANK_MARK, code: "import { Icon } from \"@iconify/react\"" },
      { filename: OTHER, code: "import { Icon } from \"@/components/leaves/Icon\"" },
    ],
    invalid: [
      {
        filename: OTHER,
        code: "import { XMarkIcon } from \"@heroicons/react/16/solid\"",
        errors: [{ messageId: "vendor" }],
      },
      {
        filename: RANK_MARK,
        code: "import { TrophyIcon } from \"@heroicons/react/24/outline\"",
        errors: [{ messageId: "vendor" }],
      },
      {
        filename: OTHER,
        code: "import { Icon } from \"@iconify/react\"",
        errors: [{ messageId: "vendor" }],
      },
      {
        filename: OTHER,
        code: "import { XIcon } from \"@phosphor-icons/react/dist/ssr\"",
        errors: [{ messageId: "vendor" }],
      },
      {
        filename: BRANDS,
        code: "import { GoogleIcon } from \"@heroicons/react/24/outline\"",
        errors: [{ messageId: "vendor" }],
      },
      {
        filename: OTHER,
        code: "import Home from \"@mui/icons-material/Home\"",
        errors: [{ messageId: "vendor" }],
      },
      {
        filename: OTHER,
        code: "import { Home } from \"iconsax-react\"",
        errors: [{ messageId: "vendor" }],
      },
      {
        filename: OTHER,
        code: "import { Home } from \"some-glyph-catalogue\"",
        errors: [{ messageId: "vendor" }],
      },
    ],
  })
})

test("the Icon leaf accepts only 24 outline and 16 solid micro", () => {
  tester.run("heroicons-families-are-closed", heroiconsFamiliesAreClosed, {
    valid: [
      { filename: ICON, code: "import { HomeIcon } from \"@heroicons/react/24/outline\"" },
      { filename: ICON, code: "import { XMarkIcon } from \"@heroicons/react/16/solid\"" },
      { filename: ICON, code: "import type { SVGProps } from \"react\"" },
    ],
    invalid: [
      {
        filename: ICON,
        code: "import { XMarkIcon } from \"@heroicons/react/20/solid\"",
        errors: [{ messageId: "family" }],
      },
      {
        filename: ICON,
        code: "import { HomeIcon } from \"@heroicons/react/24/solid\"",
        errors: [{ messageId: "family" }],
      },
      {
        filename: ICON,
        code: "import { HouseIcon } from \"@phosphor-icons/react\"",
        errors: [{ messageId: "family" }],
      },
    ],
  })
})
