"use client"

import { useTranslations } from "next-intl"
import { useQueryMyRewardWalletSwr } from "@/hooks"
import { _RewardStatRow } from "./component"

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
    const isLoading = wallet.data === undefined && !hasFailed
    if (isLoading) return <_RewardStatRow state="pending" props={{ label: t("rewardPoints") }} />
    if (hasFailed || !wallet.data) return <_RewardStatRow state="empty" />

    return <_RewardStatRow state="settled" props={{ label: t("rewardPoints"), value: t("points", { balance: wallet.data.balance ?? 0 }) }} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "identity" } as const
