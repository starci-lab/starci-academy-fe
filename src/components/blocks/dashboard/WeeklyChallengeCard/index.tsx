"use client"

import { useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useMutateClaimWeeklyChallengeRewardSwr, useQueryWeeklyChallengeSwr } from "@/hooks"
import { WeeklyChallengeCardBase } from "./component"

const relativeLabel = (locale: string, iso: string) => {
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
    const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000)
    if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute")
    const hours = Math.round(minutes / 60)
    return Math.abs(hours) < 24 ? formatter.format(hours, "hour") : formatter.format(Math.round(hours / 24), "day")
}

/** Connected half: owns the featured challenge query, claim mutation and route. */
export const WeeklyChallengeCard = () => {
    const t = useTranslations("weeklyChallenge")
    const locale = useLocale()
    const router = useRouter()
    const challenge = useQueryWeeklyChallengeSwr()
    const claim = useMutateClaimWeeklyChallengeRewardSwr()
    const [isClaiming, setIsClaiming] = useState(false)
    const data = challenge.data
    const countdown = useMemo(() => {
        if (data === null || data === undefined) return undefined
        const remaining = Math.max(0, new Date(data.weekEndAt).getTime() - Date.now())
        return { days: Math.floor(remaining / 86_400_000), hours: Math.floor((remaining % 86_400_000) / 3_600_000) }
    }, [data])
    const state = challenge.error !== undefined && data === undefined
        ? "failed"
        : data === undefined
            ? "pending"
            : data === null
                ? "empty"
                : "ready"
    const act = async () => {
        if (data === null || data === undefined) return
        if (!data.viewerPassed || data.claimed) {
            router.push(`/challenges/${data.challengeGlobalId}`)
            return
        }
        setIsClaiming(true)
        try {
            await claim.trigger()
            await challenge.mutate()
        } finally {
            setIsClaiming(false)
        }
    }

    return (
        <WeeklyChallengeCardBase
            state={state}
            props={{
                label: t("title"),
                emptyMessage: t("empty"),
                errorMessage: t("failed"),
                retryLabel: t("retry"),
                title: data?.title,
                endsInLabel: countdown === undefined ? undefined : t("endsIn", countdown),
                passedCountLabel: data === null || data === undefined ? undefined : t("passedCount", { count: data.passedCount }),
                claimedLabel: t("claimed"),
                viewerPassed: data?.viewerPassed,
                claimed: data?.claimed,
                actionLabel: data?.viewerPassed && !data.claimed ? t("claim", { count: data.coinReward ?? 0 }) : t("tryNow"),
                isClaiming,
                finishers: data?.leaderboard.slice(0, 5).map((entry, index) => ({
                    id: `${entry.username}-${index}`,
                    label: entry.username,
                    passedAtLabel: relativeLabel(locale, entry.passedAt),
                })),
            }}
            on={{ retry: () => { void challenge.mutate() }, act: () => { void act() } }}
        />
    )
}

export * from "./component"

/** Source-level tier marker for the connected dashboard block. */
export const meta = { world: "connected", domain: "dashboard" } as const
