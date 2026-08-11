/** Regression tests for the mandatory connected/presentational block split. */
import test from "node:test"
import { RuleTester } from "eslint"
import tsParser from "@typescript-eslint/parser"
import { connectedBlockHasPresentationalTwin } from "./connected-block-twins.mjs"

const tester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    ecmaVersion: 2022,
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

test("connected blocks cannot bypass their exact pure twin", () => {
  tester.run("connected-block-has-presentational-twin", connectedBlockHasPresentationalTwin, {
    valid: [
      {
        filename: "D:/repo/src/components/blocks/dashboard/CreditStatRow/index.tsx",
        code: `
          import { useTranslations } from "next-intl"
          import { useQueryMyAiQuotaSwr } from "@/hooks"
          import { _CreditStatRow } from "./component"
          export const CreditStatRow = () => {
            const t = useTranslations("identity")
            const quota = useQueryMyAiQuotaSwr()
            return <_CreditStatRow state={quota.data ? "ready" : "pending"} props={{ label: t("credit") }} />
          }
        `,
      },
      {
        filename: "D:/repo/src/components/blocks/dashboard/QuickActions/index.tsx",
        code: "export const QuickActions = ({ props }) => <ActionList props={props} />",
      },
      {
        filename: "D:/repo/src/components/leaves/StatRow/index.tsx",
        code: "export const StatRow = ({ props }) => <div>{props.value}</div>",
      },
    ],
    invalid: [
      {
        filename: "D:/repo/src/components/blocks/dashboard/CreditStatRow/index.tsx",
        code: `
          import { useTranslations } from "next-intl"
          import { useQueryMyAiQuotaSwr } from "@/hooks"
          import { StatRow } from "@/components/leaves/StatRow"
          export const CreditStatRow = () => {
            const t = useTranslations("identity")
            const quota = useQueryMyAiQuotaSwr()
            return <StatRow props={{ label: t("credit"), value: quota.data?.credit }} />
          }
        `,
        errors: [{ messageId: "missing", data: { block: "CreditStatRow", twin: "_CreditStatRow" } }],
      },
      {
        filename: "D:/repo/src/components/blocks/dashboard/CreditStatRow/index.tsx",
        code: `
          import { useTranslations } from "next-intl"
          import { _CreditStatRow } from "./component"
          export const CreditStatRow = () => {
            const t = useTranslations("identity")
            return t("empty") ? <StatRow /> : <_CreditStatRow state="ready" props={{ label: t("credit") }} />
          }
        `,
        errors: [{ messageId: "bypass", data: { block: "CreditStatRow", rendered: "StatRow", twin: "_CreditStatRow" } }],
      },
      {
        filename: "D:/repo/src/components/blocks/dashboard/CreditStatRow/index.tsx",
        code: `
          import { useTranslations as useCopy } from "next-intl"
          import { _CreditStatRow } from "./component"
          export const CreditStatRow = () => {
            const t = useCopy("identity")
            return null
          }
        `,
        errors: [{ messageId: "unused", data: { block: "CreditStatRow", twin: "_CreditStatRow" } }],
      },
      {
        filename: "D:/repo/src/components/blocks/dashboard/QuickActions/index.tsx",
        code: `
          import { useRouter } from "next/navigation"
          export const QuickActions = () => {
            const router = useRouter()
            return <ActionList on={{ activate: router.push }} />
          }
        `,
        errors: [{ messageId: "missing", data: { block: "QuickActions", twin: "_QuickActions" } }],
      },
    ],
  })
})
