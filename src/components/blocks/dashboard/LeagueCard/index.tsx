"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useQueryMeSwr, useQueryMyLeagueSwr } from "@/hooks"
import type { RankedUserVerdict } from "@/components/composites/RankedUserRow"
import { _LeagueCard } from "./component"

/** Fetch and resolve the viewer's weekly league. */
export const LeagueCard = () => {
    const t = useTranslations("community")
    const router = useRouter()
    const query = useQueryMyLeagueSwr()
    const me = useQueryMeSwr()
    const data = query.data
    const entries = data?.entries ?? []
    const mine = entries.find((entry) => entry.username !== null && entry.username === me.data?.username)
    const top = entries.slice(0, 5)
    const rows = [
        ...top,
        ...(mine && !top.some((row) => row.userGlobalId === mine.userGlobalId) ? [mine] : []),
    ].map((entry) => {
        const isMe = entry.userGlobalId === mine?.userGlobalId
        const movementLabel = entry.rankDelta === null || entry.rankDelta === 0
            ? undefined
            : entry.rankDelta > 0
                ? t("up", { count: entry.rankDelta })
                : t("down", { count: Math.abs(entry.rankDelta) })
        const verdict: RankedUserVerdict | undefined = entry.rankDelta === null || entry.rankDelta === 0
            ? undefined
            : entry.rankDelta > 0 ? "success" : "danger"
        const username = entry.username ?? t("anonymous")
        return {
            id: entry.userGlobalId,
            rank: entry.rank,
            rankLabel: t("league.rank", { rank: entry.rank }),
            name: isMe ? `${username} · ${t("you")}` : username,
            avatar: entry.avatar,
            subtitle: entry.rankDelta === null || entry.rankDelta === 0 ? t("noMovement") : movementLabel,
            points: t("points", { count: entry.weekPoints }),
            movementLabel,
            verdict,
            isMe,
        }
    })
    const days = data
        ? Math.max(0, Math.ceil((Date.parse(data.weekEndAt) - Date.now()) / 86400000))
        : 0
    const props = {
        label: t("league.heading"),
        seeMoreLabel: t("seeMore"),
        standing: {
            rank: mine?.rank,
            rankLabel: mine ? t("league.rank", { rank: mine.rank }) : undefined,
            title: mine ? t("league.rank", { rank: mine.rank }) : t("league.unplaced"),
            subtitle: mine ? t("points", { count: mine.weekPoints }) : t("league.empty"),
            fact: data ? t("daysLeft", { count: days }) : undefined,
        },
        rows,
        emptyMessage: t("league.empty"),
        errorMessage: t("league.failed"),
        retryLabel: t("retry"),
    }
    if (query.error !== undefined && query.data === undefined) {
        return <_LeagueCard state="failed" props={props} on={{ retry: () => { void query.mutate() } }} />
    }
    if (query.data === undefined) return <_LeagueCard state="pending" props={props} />
    if (rows.length === 0) return <_LeagueCard state="empty" props={props} />
    return (
        <_LeagueCard
            state="ready"
            props={props}
            on={{
                seeMore: () => router.push("/league"),
                ...Object.fromEntries(rows.map((row) => [
                    `open:${row.id}`,
                    () => {
                        if (!row.isMe && row.name !== t("anonymous")) router.push(`/profile/${row.name}`)
                    },
                ])),
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "community" } as const
