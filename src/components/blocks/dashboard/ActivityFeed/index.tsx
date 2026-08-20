"use client"

import { useMemo } from "react"
import { useLocale, useTranslations } from "next-intl"
import type { QueryMyFeedItemData } from "@/modules/api/graphql/queries/types/my-feed"
import { ActivityType } from "@/modules/api/graphql/queries/types/my-feed"
import { ReactionType } from "@/modules/api/graphql/queries/types/reactions"
import type { ActivityDayData, ActivityFeedActions } from "./component"
import { ActivityFeedBase } from "./component"

/** Remote activity rows and state resolved by the feed controller. */
export type ActivityFeedConnectedProps = {
    readonly state: "pending" | "filteredEmpty" | "platformEmpty" | "failed" | "ready"
    readonly items: ReadonlyArray<QueryMyFeedItemData>
    readonly on?: ActivityFeedActions
    readonly message: string
    readonly description?: string
    readonly actionLabel?: string
    readonly reactingId?: string
}

const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()

type ActivityRollup = {
    readonly head: QueryMyFeedItemData
    readonly count: number
}

const activityActionOf = (item: QueryMyFeedItemData, count: number, t: (key: string, values?: { readonly count: number }) => string) => {
    if (item.type === ActivityType.MilestonePassed && count > 1) return t("activity.milestonePassedGrouped", { count })
    const activityKey = item.type === ActivityType.LessonRead ? "contentRead" : item.type
    return t(`activity.${activityKey}`)
}

const dayLabelOf = (key: number, today: number, at: Date, locale: string, t: (key: string) => string) => {
    if (key === today) return t("today")
    if (key === today - 86_400_000) return t("yesterday")
    return at.toLocaleDateString(locale, { dateStyle: "long" })
}

/** Preserve legacy's one-row summary for consecutive milestones by the same actor. */
const rollUpMilestones = (items: ReadonlyArray<QueryMyFeedItemData>): ReadonlyArray<ActivityRollup> => {
    const rolled: Array<ActivityRollup> = []
    for (const item of items) {
        const previous = rolled[rolled.length - 1]
        if (
            item.type === ActivityType.MilestonePassed
            && previous !== undefined
            && previous.head.type === ActivityType.MilestonePassed
            && previous.head.actorGlobalId === item.actorGlobalId
        ) {
            rolled[rolled.length - 1] = { head: previous.head, count: previous.count + 1 }
        } else {
            rolled.push({ head: item, count: 1 })
        }
    }
    return rolled
}

/** Resolve activity copy, relative time and local-day grouping. */
export const ActivityFeed = (input: ActivityFeedConnectedProps) => {
    const t = useTranslations("dashboard.explore")
    const locale = useLocale()
    const days = useMemo(() => {
        const today = startOfDay(new Date())
        const groups = new Map<number, ActivityDayData>()
        for (const { head: item, count } of rollUpMilestones(input.items)) {
            const at = new Date(item.at)
            const key = startOfDay(at)
            const delta = Math.max(0, Math.floor((Date.now() - at.getTime()) / 60_000))
            const time = delta < 60 ? t("minutesAgo", { count: delta }) : t("hoursAgo", { count: Math.floor(delta / 60) })
            const isGroupedMilestone = item.type === ActivityType.MilestonePassed && count > 1
            const row = {
                id: item.id,
                actor: item.actorUsername,
                avatar: item.actorAvatar ?? undefined,
                action: activityActionOf(item, count, t),
                target: isGroupedMilestone ? undefined : item.targetLabel ?? undefined,
                time,
                reactionLabel: t("react"),
                reactionCount: item.reactionCount,
                selectedReaction: item.myReaction,
                reactionLabels: {
                    [ReactionType.Like]: t("reactions.like"),
                    [ReactionType.Love]: t("reactions.love"),
                    [ReactionType.Haha]: t("reactions.haha"),
                    [ReactionType.Wow]: t("reactions.wow"),
                    [ReactionType.Sad]: t("reactions.sad"),
                    [ReactionType.Angry]: t("reactions.angry"),
                },
                isMine: item.isMine,
                isReacting: item.id === input.reactingId,
            }
            const existing = groups.get(key)
            if (existing !== undefined) groups.set(key, { ...existing, rows: [...existing.rows, row] })
            else groups.set(key, {
                id: String(key),
                label: dayLabelOf(key, today, at, locale, t),
                rows: [row],
            })
        }
        return [...groups.values()]
    }, [input.items, input.reactingId, locale, t])
    return <ActivityFeedBase state={input.state} props={{
        days,
        message: input.message,
        description: input.description,
        actionLabel: input.actionLabel,
    }} on={input.on} />
}
/** Source-level ownership marker for the connected social block. */
export const meta = { world: "connected", domain: "social" } as const
