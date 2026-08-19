"use client"

import { useTranslations } from "next-intl"
import { useQueryMyDailyQuestSwr } from "@/hooks"
import { type MyDailyQuestTask } from "@/modules/api/graphql/queries/types/my-daily-quest"
import { DailyQuestBase } from "./component"
import type { LabelledProgressRowData } from "@/components/composites/LabelledProgressRow"

/**
 * BLOCK - `DailyQuest`, connected half.
 *
 * It reads ONE request and settles ONE state. The distinction it owns is the one nothing
 * downstream can make: a day with nothing on it, versus a day that has not arrived.
 *
 * THE THREE SITUATIONS IT SEPARATES are not derivable from each other, which is why the server
 * sends both flags: a day where every task is done is not a day that has been collected for, and
 * a screen inferring one from the other would either offer the same reward twice or never offer
 * it at all.
 */

/**
 * Turn one task into a row.
 *
 * THE FIGURE IS "current/target", NOT A PERCENTAGE, and the bar carries the percentage instead. A
 * quest is counted in whole things done - read five cards, pass one challenge - so "2/5" is the
 * fact a reader is tracking, and "40%" makes them do arithmetic to get back to it.
 *
 * @param task - One task of the payload.
 * @param label - The already-resolved name of that task.
 */
const toRow = (task: MyDailyQuestTask, label: string): LabelledProgressRowData => {
    // A target of zero would be a bug upstream, but it must not become a division by zero here.
    const percent = task.target > 0
        ? Math.min(100, Math.max(0, Math.round((task.current / task.target) * 100)))
        : 0
    return { id: task.key, title: label, percent, percentText: `${task.current}/${task.target}` }
}

/**
 * Fetch the day's quest and render it.
 */
export const DailyQuest = () => {
    const t = useTranslations("quest")
    const quest = useQueryMyDailyQuestSwr()
    const label = t("heading")

    const retry = () => {
        void quest.mutate()
    }

    if (quest.error !== undefined && quest.error !== null) {
        return (
            <DailyQuestBase
                state="failed"
                props={{ label, message: t("failed"), retryLabel: t("retry") }}
                on={{ retry }}
            />
        )
    }

    const data = quest.data
    if (data === undefined) {
        return <DailyQuestBase state="pending" props={{ label }} />
    }
    if (data === null || data.tasks.length === 0) {
        return <DailyQuestBase state="empty" props={{ label, message: t("empty") }} />
    }

    const body = {
        tasks: data.tasks.map((task) => toRow(task, t(`tasks.${task.key}`))),
        rewardLine: t("reward", { count: data.reward }),
    }

    if (data.claimed) {
        return <DailyQuestBase state="claimed" props={{ label, ...body, claimedLine: t("claimed") }} />
    }
    if (data.allDone) {
        return <DailyQuestBase state="claimable" props={{ label, ...body, claimLabel: t("claim") }} />
    }
    return <DailyQuestBase state="open" props={{ label, ...body }} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "quest" } as const
