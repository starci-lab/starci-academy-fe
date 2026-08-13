"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useMutateSetFollowSwr, useQueryGlobalLeaderboardSwr, useQueryMeSwr } from "@/hooks"
import { fromGlobalId } from "@/modules/utils/global-id"
import { _TopLearners } from "./component"

/** Fetch global standing and own optimistic follow rollback. */
export const TopLearners = () => {
    const t = useTranslations("community")
    const router = useRouter()
    const query = useQueryGlobalLeaderboardSwr()
    const me = useQueryMeSwr()
    const mutation = useMutateSetFollowSwr()
    const [overrides, setOverrides] = useState<ReadonlyMap<string, boolean>>(new Map())
    const [pending, setPending] = useState<string>()
    const data = query.data
    const shown = data?.entries.slice(0, 5) ?? []
    const viewerInTop = shown.some((entry) => entry.username !== null && entry.username === me.data?.username)
    const entries = [
        ...shown,
        ...(!viewerInTop && data ? [{
            userGlobalId: "self",
            username: me.data?.username ?? null,
            avatar: me.data?.avatar ?? null,
            points: data.myPoints,
            rank: data.myRank,
            isFollowing: false,
        }] : []),
    ]
    const rows = entries.map((entry) => {
        const isMe = entry.username === me.data?.username
        const username = entry.username ?? t("anonymous")
        return {
            id: entry.userGlobalId,
            rank: entry.rank,
            rankLabel: t("top.rankLine", { rank: entry.rank }),
            name: isMe ? `${username} · ${t("you")}` : username,
            avatar: entry.avatar,
            points: t("points", { count: entry.points }),
            isFollowing: overrides.get(entry.userGlobalId) ?? entry.isFollowing,
            isPending: pending === entry.userGlobalId,
            isMe,
            // No follow control on the dashboard. This card is a PREVIEW of the leaderboard - it
            // exists so a learner sees where they stand without leaving the page - and a row of
            // press targets turns a glance into a decision. Following belongs on the board itself.
        }
    })
    const props = {
        label: t("top.heading"),
        seeMoreLabel: t("seeMore"),
        standing: {
            rank: data?.myRank,
            rankLabel: data ? t("top.rankLine", { rank: data.myRank }) : undefined,
            title: t("top.rankLine", { rank: data?.myRank ?? 0 }),
            subtitle: t("points", { count: data?.myPoints ?? 0 }),
        },
        rows,
        emptyMessage: t("top.empty"),
        errorMessage: t("top.failed"),
        retryLabel: t("retry"),
    }
    if (query.error !== undefined && data === undefined) {
        return <_TopLearners state="failed" props={props} on={{ retry: () => { void query.mutate() } }} />
    }
    if (data === undefined) return <_TopLearners state="pending" props={props} />
    if (data === null || data.entries.length === 0) return <_TopLearners state="empty" props={props} />
    const on = Object.fromEntries(rows.flatMap((row) => [
        [
            `open:${row.id}`,
            () => {
                if (!row.isMe && row.name !== t("anonymous")) router.push(`/profile/${row.name}`)
            },
        ],
        [
            `follow:${row.id}`,
            async () => {
                const decoded = fromGlobalId(row.id)
                if (decoded === null || row.isMe) return
                const previous = row.isFollowing === true
                setOverrides((current) => new Map(current).set(row.id, !previous))
                setPending(row.id)
                try {
                    const result = await mutation.trigger({ userId: decoded.id, follow: !previous })
                    if (result.data?.setFollow?.success !== true) {
                        setOverrides((current) => new Map(current).set(row.id, previous))
                    }
                } catch {
                    setOverrides((current) => new Map(current).set(row.id, previous))
                } finally {
                    setPending(undefined)
                }
            },
        ],
    ]))
    return (
        <_TopLearners
            state="ready"
            props={props}
            on={{ seeMore: () => router.push("/league"), ...on }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "community" } as const
