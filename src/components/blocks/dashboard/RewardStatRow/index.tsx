"use client"

import { useTranslations } from "next-intl"
import { useQueryMyRewardWalletSwr } from "@/hooks"
import { StatRow } from "@/components/leaves/StatRow"

/**
 * BLOCK - `RewardStatRow`: the reward balance, on the identity rail.
 *
 * ONE REQUEST, ONE SETTLING UNIT. See {@link StreakStatRow} for why the rail is three blocks and
 * not one, and why none of them carries a `state`.
 */
export const RewardStatRow = () => {
    const t = useTranslations("identity")
    const wallet = useQueryMyRewardWalletSwr()

    const hasFailed = wallet.error !== undefined && wallet.error !== null
    const isLoading = !wallet.data && !hasFailed && wallet.isLoading === true
    const value = hasFailed || !wallet.data
        ? t("empty")
        : t("points", { balance: wallet.data.balance ?? 0 })

    return <StatRow props={{ icon: "reward", label: t("rewardPoints"), value }} isLoading={isLoading} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "identity" } as const
