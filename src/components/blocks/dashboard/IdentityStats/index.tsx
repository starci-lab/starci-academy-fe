"use client"

import {
    useQueryMyAiQuotaSwr,
    useQueryMyRewardWalletSwr,
    useQueryMyWeeklyStatsSwr,
} from "@/hooks"
import {
    _IdentityStats,
    type IdentityStatRow,
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
 * The two fields of a settled request that decide which shape a row is in.
 *
 * It deliberately describes NOTHING about the payload: the payload type is whatever the
 * hook already says it is, read straight off `weekly.data` below, so a field that
 * changes shape upstream fails to compile here instead of being waved through. This
 * block used to restate each payload as a local slice and then double-cast the hook
 * onto it, which silenced exactly the check the restating was supposed to buy.
 */
interface StatLeaf {
    /**
     * The settled payload. `undefined` until the request answers, `null` when the server
     * answered with nothing - the hooks keep those two apart on purpose, and this block
     * treats both as "no value", the difference being which flag it turns into.
     */
    data: unknown
    /**
     * True while the FIRST request is still in flight - SWR's `isLoading`, which is
     * false for every revalidation after it. `isValidating` is deliberately not read:
     * it goes true on every focus, and a row that rested on it would blink over a
     * figure the reader was already reading.
     */
    isLoading: boolean
}

/** Copy this block renders. It moves to the translation tier when that tier exists. */
const LABELS: IdentityStatsLabels = {
    heading: "Your standing",
    loading: "Loading",
    empty: "Not available",
}

/**
 * Turn one request into the two flags one row is drawn from. A row rests only on a
 * FIRST load - once anything is in hand the row shows it, so a refetch never blanks a
 * value the reader was already reading; and a request that came back with nothing is
 * empty rather than resting, because a settled nothing has an answer to give.
 *
 * @param leaf - The request being read.
 */
const leafFlags = (leaf: StatLeaf): Pick<IdentityStatRow, "isLoading" | "isEmpty"> => {
    if (leaf.data !== null && leaf.data !== undefined) return { isLoading: false, isEmpty: false }
    if (leaf.isLoading) return { isLoading: true, isEmpty: false }
    return { isLoading: false, isEmpty: true }
}

/**
 * Fetch the three standing figures and render them.
 */
export const IdentityStats = () => {
    const weekly = useQueryMyWeeklyStatsSwr()
    const quota = useQueryMyAiQuotaSwr()
    const wallet = useQueryMyRewardWalletSwr()

    const credit = quota.data?.credit
    const rows: ReadonlyArray<IdentityStatRow> = [
        {
            label: "Streak",
            ...leafFlags(weekly),
            value: `${weekly.data?.streak ?? 0} days`,
        },
        {
            label: "AI credit",
            ...leafFlags(quota),
            value: credit ? `${credit.remainingWeek} of ${credit.limitWeek}` : "",
        },
        {
            label: "Reward points",
            ...leafFlags(wallet),
            value: `${wallet.data?.balance ?? 0}`,
        },
    ]

    return <_IdentityStats rows={rows} labels={LABELS} />
}
