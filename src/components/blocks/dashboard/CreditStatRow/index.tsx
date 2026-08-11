"use client"

import { useTranslations } from "next-intl"
import { useQueryMyAiQuotaSwr } from "@/hooks"
import { _CreditStatRow } from "./component"

/**
 * BLOCK - `CreditStatRow`: this week's remaining AI credit, on the identity rail.
 *
 * ONE REQUEST, ONE SETTLING UNIT. See {@link StreakStatRow} for why the rail is three blocks and
 * not one, and why none of them carries a `state`.
 */
export const CreditStatRow = () => {
    const t = useTranslations("identity")
    const quota = useQueryMyAiQuotaSwr()

    const hasFailed = quota.error !== undefined && quota.error !== null
    const isLoading = !quota.data && !hasFailed && quota.isLoading === true
    const credit = quota.data?.credit
    const value = credit
        ? t("creditOf", { remaining: credit.remainingWeek, limit: credit.limitWeek })
        : t("empty")

    if (isLoading) return <_CreditStatRow state="pending" props={{ label: t("aiCredit") }} />

    return <_CreditStatRow state="settled" props={{ label: t("aiCredit"), value }} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "identity" } as const
