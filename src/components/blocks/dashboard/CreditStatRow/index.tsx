"use client"

import { useTranslations } from "next-intl"
import { useQueryMyAiQuotaSwr } from "@/hooks"
import { CreditStatRowBase } from "./component"

/**
 * BLOCK - `CreditStatRow`: this week's remaining AI credit, on the identity rail.
 *
 * ONE REQUEST, ONE SETTLING UNIT. See {@link StreakStatRow} for why the rail is three blocks and
 * not one, and why none of them carries a `state`.
 */
/** Props for the connected credit stat row. */
export type CreditStatRowProps = Record<string, never>
/** Connect the CreditStatRow block to its data source. */
export const CreditStatRow = (props: CreditStatRowProps) => {
    void props
    const t = useTranslations("identity")
    const quota = useQueryMyAiQuotaSwr()

    const hasFailed = quota.error !== undefined && quota.error !== null
    const isLoading = quota.data === undefined && !hasFailed
    const credit = quota.data?.credit
    if (isLoading) return <CreditStatRowBase state="pending" props={{ label: t("aiCredit") }} />
    if (hasFailed || credit === undefined) return <CreditStatRowBase state="empty" />

    return <CreditStatRowBase state="settled" props={{ label: t("aiCredit"), value: t("creditOf", { remaining: credit.remainingWeek, limit: credit.limitWeek }) }} />
}
