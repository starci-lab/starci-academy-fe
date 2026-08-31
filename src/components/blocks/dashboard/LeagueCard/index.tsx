"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryMeSwr, useQueryMyLeagueSwr } from "@/hooks"
import type { RankedUserVerdict } from "@/components/composites/RankedUserRow"
import { LeagueCardBase } from "./component"

/** Fetch and resolve the viewer's weekly league. */
/** Props for the connected league card. */
export type LeagueCardProps = Record<string, never>
/** Connect the LeagueCard block to its data source. */
export const LeagueCard = (props: LeagueCardProps) => {
    void props
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
            ? t("noMovement")
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
            rankLabel: t("league.rankLine", { rank: entry.rank, percent: 100 }),
            name: isMe ? `${username} · ${t("you")}` : username,
            avatar: entry.avatar,
            points: t("points", { count: entry.weekPoints }),
            // The caret reports the movement itself; the sentence survives as its label. A
            // subtitle under every unmoved name would double each row for a fact the reference
            // does not show.
            rankDelta: entry.rankDelta,
            movementLabel,
            verdict,
            isMe,
        }
    })
    // The cohort is the denominator: a percentile against anything else would be a different
    // claim wearing the same "%" sign.
    const percent = mine && entries.length > 0
        ? Math.max(1, Math.ceil((mine.rank / entries.length) * 100))
        : undefined
    const remaining = data ? Math.max(0, Date.parse(data.weekEndAt) - Date.now()) : 0
    const countdown = {
        days: Math.floor(remaining / 86_400_000),
        hours: Math.floor((remaining % 86_400_000) / 3_600_000),
    }
    const viewProps = {
        label: t("league.heading"),
        seeMoreLabel: t("seeMore"),
        standing: {
            rank: mine?.rank,
            rankLabel: mine && percent !== undefined
                ? t("league.rankLine", { rank: mine.rank, percent })
                : undefined,
            title: mine && percent !== undefined
                ? t("league.rankLine", { rank: mine.rank, percent })
                : t("league.unplaced"),
            // Points and the reset deadline are ONE sentence about the same week. Splitting the
            // countdown into a badge of its own made it look like a warning about something else.
            subtitle: mine && data
                ? `${t("points", { count: mine.weekPoints })} · ${t("resetIn", countdown)}`
                : data && entries.length > 0
                    ? t("league.empty")
                    : undefined,
        },
        rows,
        emptyMessage: t("league.empty"),
        errorMessage: t("league.failed"),
        retryLabel: t("retry"),
    }
    if (query.error !== undefined && query.data === undefined) {
        return <LeagueCardBase state="failed" props={viewProps} on={{ retry: () => { void query.mutate() } }} />
    }
    if (query.data === undefined) return <LeagueCardBase state="pending" props={viewProps} />
    if (rows.length === 0) return <LeagueCardBase state="empty" props={viewProps} />
    return (
        <LeagueCardBase
            state="ready"
            props={viewProps}
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
