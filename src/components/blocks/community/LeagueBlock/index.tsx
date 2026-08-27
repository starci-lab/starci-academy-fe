"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useMutateSetFollowSwr, useQueryGlobalLeaderboardSwr, useQueryMeSwr, useQueryMyLeagueSwr } from "@/hooks"
import { fromGlobalId } from "@/modules/utils/global-id"
import type { RankedUserRowData, RankedUserVerdict } from "@/components/composites/RankedUserRow"
import { LeagueBlockBase, type LeagueBlockData } from "./component"

/** URL-selected competition scope consumed by the connected board. */
export type LeagueBlockScope = "weekly" | "global"
/** Connected board route input; scope selection remains page-owned. */
export type LeagueBlockProps = { readonly scope: LeagueBlockScope }

const PODIUM_SIZE = 3
const rankVerdict = (delta: number | null): RankedUserVerdict | undefined => delta === null || delta === 0 ? undefined : delta > 0 ? "success" : "danger"
const movementLabel = (delta: number | null, t: (key: string, values?: Record<string, string | number | Date>) => string) => delta === null || delta === 0 ? t("noMovement") : delta > 0 ? t("up", { count: delta }) : t("down", { count: Math.abs(delta) })

/** Resolve board query data, pending/empty/error state and follow actions. */
export const LeagueBlock = (props: LeagueBlockProps) => {
    const { scope } = props
    const t = useTranslations("community")
    const router = useRouter()
    const me = useQueryMeSwr()
    const weekly = useQueryMyLeagueSwr()
    const global = useQueryGlobalLeaderboardSwr()
    const mutation = useMutateSetFollowSwr()
    const [overrides, setOverrides] = useState<ReadonlyMap<string, boolean>>(new Map())
    const [pending, setPending] = useState<string>()
    const query = scope === "weekly" ? weekly : global
    const weeklyEntries = weekly.data?.entries ?? []
    const mine = weeklyEntries.find((entry) => entry.username !== null && entry.username === me.data?.username)
    const globalData = global.data
    const percent = mine?.rank !== undefined && weeklyEntries.length > 0 ? Math.max(1, Math.ceil((mine.rank / weeklyEntries.length) * 100)) : undefined
    const remaining = weekly.data ? Math.max(0, Date.parse(weekly.data.weekEndAt) - Date.now()) : 0
    const countdown = { days: Math.floor(remaining / 86_400_000), hours: Math.floor((remaining % 86_400_000) / 3_600_000) }
    const toggleFollow = async (globalId: string, following: boolean) => {
        const decoded = fromGlobalId(globalId)
        if (decoded === null) return
        setOverrides((current) => new Map(current).set(globalId, !following)); setPending(globalId)
        try { const result = await mutation.trigger({ userId: decoded.id, follow: !following }); if (result.data?.setFollow?.success !== true) setOverrides((current) => new Map(current).set(globalId, following)) }
        catch { setOverrides((current) => new Map(current).set(globalId, following)) }
        finally { setPending(undefined) }
    }
    const openProfile = (name: string, isMe: boolean) => { if (!isMe && name !== t("anonymous")) router.push(`/profile/${name}`) }
    const weeklyRows: ReadonlyArray<RankedUserRowData> = weeklyEntries.slice(PODIUM_SIZE).map((entry) => {
        const isMe = entry.userGlobalId === mine?.userGlobalId; const username = entry.username ?? t("anonymous")
        return { id: entry.userGlobalId, rank: entry.rank, rankLabel: t("league.rankLine", { rank: entry.rank, percent: percent ?? 100 }), name: isMe ? `${username} · ${t("you")}` : username, avatar: entry.avatar, points: t("points", { count: entry.weekPoints }), rankDelta: entry.rankDelta, movementLabel: movementLabel(entry.rankDelta, t), verdict: rankVerdict(entry.rankDelta), isMe, isFollowing: overrides.get(entry.userGlobalId) ?? false, isPending: pending === entry.userGlobalId, followLabel: t("follow"), followingLabel: t("following") }
    })
    const globalShown = globalData?.entries ?? []
    const viewerInGlobal = globalShown.some((entry) => entry.username !== null && entry.username === me.data?.username)
    const hiddenBetween = globalData ? Math.max(0, globalData.myRank - globalShown.length - 1) : 0
    const globalRows: ReadonlyArray<RankedUserRowData> = globalShown.slice(PODIUM_SIZE).map((entry) => { const isMe = entry.username !== null && entry.username === me.data?.username; const username = entry.username ?? t("anonymous"); return { id: entry.userGlobalId, rank: entry.rank, rankLabel: t("top.rankLine", { rank: entry.rank }), name: isMe ? `${username} · ${t("you")}` : username, avatar: entry.avatar, points: t("points", { count: entry.points }), isFollowing: overrides.get(entry.userGlobalId) ?? entry.isFollowing, isPending: pending === entry.userGlobalId, isMe, followLabel: t("follow"), followingLabel: t("following") } })
    const board: LeagueBlockData = scope === "weekly" ? {
        standing: { rank: mine?.rank, rankLabel: mine?.rank === undefined || percent === undefined ? undefined : t("league.rankLine", { rank: mine.rank, percent }), title: mine?.rank === undefined || percent === undefined ? t("league.unplaced") : t("league.rankLine", { rank: mine.rank, percent }), subtitle: mine?.weekPoints === undefined || weekly.data === undefined ? t("league.empty") : `${t("points", { count: mine.weekPoints })} · ${t("resetIn", countdown)}` },
        ctaLabel: t("climbCta"), progressAccessibleLabel: t("pageTitle"), podium: weeklyEntries.slice(0, PODIUM_SIZE).map((entry) => ({ rank: entry.rank, username: entry.username, avatar: entry.avatar, rankLabel: t("league.rankLine", { rank: entry.rank, percent: percent ?? 100 }), pointsLabel: t("points", { count: entry.weekPoints }), isMe: entry.userGlobalId === mine?.userGlobalId })), meLabel: t("you"), anonymousLabel: t("anonymous"), rows: weeklyRows, listLabel: t("league.heading"), emptyMessage: t("league.empty"), errorMessage: t("league.failed"), retryLabel: t("retry"),
    } : {
        standing: { rank: globalData?.myRank, rankLabel: globalData ? t("top.rankLine", { rank: globalData.myRank }) : undefined, title: t("top.rankLine", { rank: globalData?.myRank ?? 0 }), subtitle: t("points", { count: globalData?.myPoints ?? 0 }) },
        ctaLabel: t("climbCta"), progressAccessibleLabel: t("pageTitle"), podium: globalShown.slice(0, PODIUM_SIZE).map((entry) => ({ rank: entry.rank, username: entry.username, avatar: entry.avatar, rankLabel: t("top.rankLine", { rank: entry.rank }), pointsLabel: t("points", { count: entry.points }), isMe: entry.username !== null && entry.username === me.data?.username })), meLabel: t("you"), anonymousLabel: t("anonymous"), rows: globalRows, ...(globalData && !viewerInGlobal ? { selfRow: { id: "self", rank: globalData.myRank, rankLabel: t("top.rankLine", { rank: globalData.myRank }), name: `${me.data?.username ?? t("anonymous")} · ${t("you")}`, avatar: me.data?.avatar ?? null, points: t("points", { count: globalData.myPoints }), isMe: true }, ...(hiddenBetween > 0 ? { ellipsisLabel: `⋯ ${t("othersCount", { count: hiddenBetween })}` } : {}) } : {}), listLabel: t("top.heading"), emptyMessage: t("top.empty"), errorMessage: t("top.failed"), retryLabel: t("retry"),
    }
    const state = query.error !== undefined && query.data === undefined ? "failed" as const : query.data === undefined ? "pending" as const : board.podium.length === 0 && board.rows.length === 0 ? "empty" as const : "ready" as const
    return <LeagueBlockBase state={state} data={board} on={{ climb: () => router.push("/dashboard?tab=courses"), retry: () => { void query.mutate() }, open: (id) => { const row = [...weeklyRows, ...globalRows].find((candidate) => candidate.id === id); if (row !== undefined) openProfile(row.name ?? "", row.isMe === true) }, follow: (id) => { const row = [...weeklyRows, ...globalRows].find((candidate) => candidate.id === id); if (row !== undefined) void toggleFollow(id, row.isFollowing === true) } }} />
}

export { LeagueBlockBase } from "./component"
export type { LeagueBlockData, LeagueBlockActions, LeagueBlockProps as LeagueBlockViewProps } from "./component"
