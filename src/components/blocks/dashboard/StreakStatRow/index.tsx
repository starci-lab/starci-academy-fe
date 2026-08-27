"use client"

import { useTranslations } from "next-intl"
import { useQueryMyWeeklyStatsSwr } from "@/hooks"
import { StreakStatRowBase } from "./component"

/**
 * BLOCK - `StreakStatRow`: the standing streak figure, on the identity rail.
 *
 * ONE REQUEST, ONE SETTLING UNIT. It was a third of a component that read three requests and gave
 * them one flag between them - so a wallet answering in 80ms waited on an AI quota taking 600ms.
 * Three requests settle at three moments, so they are three blocks.
 *
 * IT HAS NO `state`, AND THAT IS THE MODEL WORKING RATHER THAN AN OMISSION. A state is a situation
 * that picks a different TREE. Loading, empty, failed and ready all draw the same row here - only
 * the figure changes - so none of them is a state. They are props, and the one flag is `isLoading`.
 */
/** Props for the connected streak stat row. */
export type StreakStatRowProps = Record<string, never>
/** Connect the StreakStatRow block to its data source. */
export const StreakStatRow = (props: StreakStatRowProps) => {
    void props
    const t = useTranslations("identity")
    const weekly = useQueryMyWeeklyStatsSwr()

    // A failure is a SETTLED answer, not a wait: SWR retries a rejected key on a backoff and
    // reports `isLoading` again each time, so a row reading the flag alone shimmers for as long as
    // the backend is unreachable - which is exactly what a signed-out reader sees.
    const hasFailed = weekly.error !== undefined && weekly.error !== null
    const isLoading = weekly.data === undefined && !hasFailed
    if (isLoading) return <StreakStatRowBase state="pending" props={{ label: t("streak") }} />
    if (hasFailed || !weekly.data) return <StreakStatRowBase state="empty" />

    return <StreakStatRowBase state="settled" props={{ label: t("streak"), value: t("days", { count: weekly.data.streak ?? 0 }) }} />
}
