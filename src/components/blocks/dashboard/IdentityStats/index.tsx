"use client"

import {
    useQueryMyAiQuotaSwr,
    useQueryMyRewardWalletSwr,
    useQueryMyWeeklyStatsSwr,
} from "@/hooks"
import {
    _IdentityStats,
    type IdentityStatRow,
    type IdentityStatState,
    type IdentityStatsLabels,
} from "./component"

/**
 * BLOCK - `IdentityStats`, connected half.
 *
 * Reads its three requests, turns each one into a row state, formats each value, and
 * hands the result to the presentational half. Three separate requests are deliberate:
 * they settle at different times, and a shared flag would hold a finished row hostage
 * to a slow one.
 */

/**
 * The part of one request this block reads.
 *
 * The requests themselves are authored beside this file rather than in it, so this
 * shape is the seam between the two: it names only the fields the block touches, and
 * the cast at each call site is the single place a change on the other side surfaces.
 */
interface StatLeaf<TData> {
    /** The settled payload, absent until it arrives. */
    data?: TData
    /** True while the first request is still in flight. */
    isLoading?: boolean
}

/** The weekly-stats fields this block reads. */
interface WeeklyStatsSlice {
    /** Consecutive active days up to today. */
    streak: number
}

/** The AI-quota fields this block reads. */
interface AiQuotaSlice {
    /** Weekly credit allowance and what is left of it. */
    credit: {
        /** Credit left this week. */
        remainingWeek: number
        /** Credit allowed per week. */
        limitWeek: number
    }
}

/** The reward-wallet fields this block reads. */
interface RewardWalletSlice {
    /** Spendable reward-point balance. */
    balance: number
}

/** Copy this block renders. It moves to the translation tier when that tier exists. */
const LABELS: IdentityStatsLabels = {
    heading: "Your standing",
    loading: "Loading",
    empty: "Not available",
}

/**
 * Turn one request into the row state the presentational half renders. A row rests
 * only on a FIRST load - once anything is in hand the row shows it, so a refetch
 * never blanks a value the reader was already reading.
 *
 * @param leaf - The request being read.
 */
const leafState = (leaf: StatLeaf<unknown>): IdentityStatState => {
    if (leaf.data) return "ready"
    return leaf.isLoading === true ? "skeleton" : "empty"
}

/**
 * Fetch the three standing figures and render them.
 */
export const IdentityStats = () => {
    const weekly = useQueryMyWeeklyStatsSwr() as unknown as StatLeaf<WeeklyStatsSlice>
    const quota = useQueryMyAiQuotaSwr() as unknown as StatLeaf<AiQuotaSlice>
    const wallet = useQueryMyRewardWalletSwr() as unknown as StatLeaf<RewardWalletSlice>

    const credit = quota.data?.credit
    const rows: readonly IdentityStatRow[] = [
        {
            label: "Streak",
            state: leafState(weekly),
            value: `${weekly.data?.streak ?? 0} days`,
        },
        {
            label: "AI credit",
            state: leafState(quota),
            value: credit ? `${credit.remainingWeek} of ${credit.limitWeek}` : "",
        },
        {
            label: "Reward points",
            state: leafState(wallet),
            value: `${wallet.data?.balance ?? 0}`,
        },
    ]

    return <_IdentityStats rows={rows} labels={LABELS} />
}
