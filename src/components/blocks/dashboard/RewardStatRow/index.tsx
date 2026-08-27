"use client"

import { useTranslations } from "next-intl"
import { useQueryMyRewardWalletSwr } from "@/hooks"
import { RewardStatRowBase } from "./component"

/**
 * BLOCK - `RewardStatRow`: the reward balance, on the identity rail.
 *
 * ONE REQUEST, ONE SETTLING UNIT. See {@link StreakStatRow} for why the rail is three blocks and
 * not one, and why none of them carries a `state`.
 */
/** Props for the connected reward stat row. */
export type RewardStatRowProps = Record<string, never>
/** Connect the RewardStatRow block to its data source. */
export const RewardStatRow = (props: RewardStatRowProps) => {
    void props
    const t = useTranslations("identity")
    const wallet = useQueryMyRewardWalletSwr()

    const hasFailed = wallet.error !== undefined && wallet.error !== null
    const isLoading = wallet.data === undefined && !hasFailed
    if (isLoading) return <RewardStatRowBase state="pending" props={{ label: t("rewardPoints") }} />
    if (hasFailed || !wallet.data) return <RewardStatRowBase state="empty" />

    return <RewardStatRowBase state="settled" props={{ label: t("rewardPoints"), value: t("points", { balance: wallet.data.balance ?? 0 }) }} />
}
