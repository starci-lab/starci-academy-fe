"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useSessionRefresh } from "@/hooks/auth/useSessionRefresh"
import { useSessionToken } from "@/hooks/auth/useSessionToken"
import { useMutateSetFollowSwr, useQueryGlobalLeaderboardSwr, useQueryMeSwr, useQueryMyLeagueSwr } from "@/hooks"
import { fromGlobalId } from "@/modules/utils/global-id"
import type { RankedUserRowData, RankedUserVerdict } from "@/components/composites/RankedUserRow"
import { _LeaguePage, type LeagueScope } from "./component"

/**
 * PAGE - `LeaguePage`, connected half.
 *
 * BOTH SCOPES ARE FETCHED, ONLY ONE IS DRAWN. They are two independent requests with independent
 * lifetimes, and a learner switching scope twice should not pay for the same board twice; SWR keeps
 * whichever has already answered.
 */

/** How many ranked people the page shows before the viewer's own pinned row. */
const PODIUM_SIZE = 3

/**
 * The two competitions, as the URL spells them.
 *
 * The scope lives in the query string rather than in component state because it is part of WHICH
 * PAGE the reader is on: a link to the global board has to arrive on the global board, a reload has
 * to stay where it was, and Back has to undo a scope switch the way it undoes any other navigation.
 * State that only React knows loses all three. `?tab=` on the dashboard already works this way.
 */
const SCOPES = ["weekly", "global"] as const

/** Resolve the viewer standing and the ranked board for whichever scope is selected. */
export const LeaguePage = () => {
    const t = useTranslations("community")
    const router = useRouter()
    const searchParams = useSearchParams()
    const requested = searchParams.get("scope")
    // An unknown or missing scope resolves to the weekly board rather than an error: a hand-typed
    // or truncated link should land somewhere real, and weekly is the board reached from the
    // dashboard card most learners arrive through.
    const scope: LeagueScope = SCOPES.some((id) => id === requested) ? requested as LeagueScope : "weekly"
    // Both boards are viewer-relative - they carry "your rank" and "you follow this person" - so
    // without a session there is nothing to render and the requests answer 403 forever. The first
    // build of this page had no guard and shimmered indefinitely for a signed-out reader.
    const token = useSessionToken()
    const session = useSessionRefresh()
    const me = useQueryMeSwr()
    const weekly = useQueryMyLeagueSwr()
    const global = useQueryGlobalLeaderboardSwr()
    const mutation = useMutateSetFollowSwr()
    const [overrides, setOverrides] = useState<ReadonlyMap<string, boolean>>(new Map())
    const [pending, setPending] = useState<string>()

    const query = scope === "weekly" ? weekly : global
    const climb = () => router.push("/dashboard?tab=courses")
    const openProfile = (name: string, isMe: boolean) => {
        if (!isMe && name !== t("anonymous")) router.push(`/profile/${name}`)
    }

    /** Flip a follow optimistically and put it back if the server disagrees. */
    const toggleFollow = async (globalId: string, following: boolean) => {
        const decoded = fromGlobalId(globalId)
        if (decoded === null) return
        setOverrides((current) => new Map(current).set(globalId, !following))
        setPending(globalId)
        try {
            const result = await mutation.trigger({ userId: decoded.id, follow: !following })
            if (result.data?.setFollow?.success !== true) {
                setOverrides((current) => new Map(current).set(globalId, following))
            }
        } catch {
            setOverrides((current) => new Map(current).set(globalId, following))
        } finally {
            setPending(undefined)
        }
    }

    const weeklyEntries = weekly.data?.entries ?? []
    const mine = weeklyEntries.find((entry) => entry.username !== null && entry.username === me.data?.username)
    const globalData = global.data

    // The cohort is the denominator, so the percentile means "of the people I am actually racing".
    const percent = mine && weeklyEntries.length > 0
        ? Math.max(1, Math.ceil((mine.rank / weeklyEntries.length) * 100))
        : undefined
    const remaining = weekly.data ? Math.max(0, Date.parse(weekly.data.weekEndAt) - Date.now()) : 0
    const countdown = {
        days: Math.floor(remaining / 86_400_000),
        hours: Math.floor((remaining % 86_400_000) / 3_600_000),
    }

    // The person directly above the viewer, and only when the fetched slice actually contains them:
    // a distance to somebody nobody loaded is a number invented to fill a bar.
    const above = globalData?.entries.find((entry) => entry.rank === globalData.myRank - 1)
    const pointsToNext = above ? Math.max(0, above.points - (globalData?.myPoints ?? 0) + 1) : 0

    const weeklyRows: ReadonlyArray<RankedUserRowData> = weeklyEntries.slice(PODIUM_SIZE).map((entry) => {
        const isMe = entry.userGlobalId === mine?.userGlobalId
        const username = entry.username ?? t("anonymous")
        const verdict: RankedUserVerdict | undefined = entry.rankDelta === null || entry.rankDelta === 0
            ? undefined
            : entry.rankDelta > 0 ? "success" : "danger"
        return {
            id: entry.userGlobalId,
            rank: entry.rank,
            rankLabel: t("league.rankLine", { rank: entry.rank, percent: percent ?? 100 }),
            name: isMe ? `${username} · ${t("you")}` : username,
            avatar: entry.avatar,
            points: t("points", { count: entry.weekPoints }),
            rankDelta: entry.rankDelta,
            movementLabel: entry.rankDelta === null || entry.rankDelta === 0
                ? t("noMovement")
                : entry.rankDelta > 0
                    ? t("up", { count: entry.rankDelta })
                    : t("down", { count: Math.abs(entry.rankDelta) }),
            verdict,
            isMe,
            // The weekly board is followable too. `myLeague` carries no follow state, so the
            // control starts at "not following" for everyone and only this session's own toggles
            // move it - a real gap, recorded rather than papered over with a guess.
            isFollowing: overrides.get(entry.userGlobalId) ?? false,
            isPending: pending === entry.userGlobalId,
            followLabel: t("follow"),
            followingLabel: t("following"),
        }
    })

    const globalShown = globalData?.entries ?? []
    const viewerInGlobal = globalShown.some((entry) => entry.username !== null && entry.username === me.data?.username)
    const hiddenBetween = globalData ? Math.max(0, globalData.myRank - globalShown.length - 1) : 0
    const globalRows: ReadonlyArray<RankedUserRowData> = globalShown.slice(PODIUM_SIZE).map((entry) => {
        const isMe = entry.username !== null && entry.username === me.data?.username
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
            followLabel: t("follow"),
            followingLabel: t("following"),
        }
    })

    const board = scope === "weekly"
        ? {
            standing: {
                rank: mine?.rank,
                rankLabel: mine && percent !== undefined ? t("league.rankLine", { rank: mine.rank, percent }) : undefined,
                title: mine && percent !== undefined ? t("league.rankLine", { rank: mine.rank, percent }) : t("league.unplaced"),
                subtitle: mine && weekly.data
                    ? `${t("points", { count: mine.weekPoints })} · ${t("resetIn", countdown)}`
                    : t("league.empty"),
            },
            ctaLabel: t("climbCta"),
            progressAccessibleLabel: t("pageTitle"),
            podium: weeklyEntries.slice(0, PODIUM_SIZE).map((entry) => ({
                rank: entry.rank,
                username: entry.username,
                avatar: entry.avatar,
                rankLabel: t("league.rankLine", { rank: entry.rank, percent: percent ?? 100 }),
                pointsLabel: t("points", { count: entry.weekPoints }),
                isMe: entry.userGlobalId === mine?.userGlobalId,
            })),
            meLabel: t("you"),
            anonymousLabel: t("anonymous"),
            rows: weeklyRows,
            listLabel: t("league.heading"),
        }
        : {
            standing: {
                rank: globalData?.myRank,
                rankLabel: globalData ? t("top.rankLine", { rank: globalData.myRank }) : undefined,
                title: t("top.rankLine", { rank: globalData?.myRank ?? 0 }),
                subtitle: t("points", { count: globalData?.myPoints ?? 0 }),
            },
            ...(globalData && above && globalData.myRank > 1
                ? {
                    progress: {
                        ratio: globalData.myPoints / Math.max(1, above.points),
                        label: t("pointsToNext", { points: pointsToNext, rank: globalData.myRank - 1 }),
                    },
                }
                : {}),
            ctaLabel: t("climbCta"),
            progressAccessibleLabel: t("pageTitle"),
            podium: globalShown.slice(0, PODIUM_SIZE).map((entry) => ({
                rank: entry.rank,
                username: entry.username,
                avatar: entry.avatar,
                rankLabel: t("top.rankLine", { rank: entry.rank }),
                pointsLabel: t("points", { count: entry.points }),
                isMe: entry.username !== null && entry.username === me.data?.username,
            })),
            meLabel: t("you"),
            anonymousLabel: t("anonymous"),
            rows: globalRows,
            ...(globalData && !viewerInGlobal
                ? {
                    selfRow: {
                        id: "self",
                        rank: globalData.myRank,
                        rankLabel: t("top.rankLine", { rank: globalData.myRank }),
                        name: `${me.data?.username ?? t("anonymous")} · ${t("you")}`,
                        avatar: me.data?.avatar ?? null,
                        points: t("points", { count: globalData.myPoints }),
                        isMe: true,
                    },
                    ...(hiddenBetween > 0 ? { ellipsisLabel: `⋯ ${t("othersCount", { count: hiddenBetween })}` } : {}),
                }
                : {}),
            listLabel: t("top.heading"),
        }

    const props = {
        title: t("pageTitle"),
        // The trail ends where the reader is, so the last step carries no destination.
        trail: [
            { id: "home", label: t("breadcrumbHome") },
            { id: "league", label: t("pageTitle") },
        ],
        scopeLabel: t("pageTitle"),
        scope,
        weeklyLabel: t("tabWeekly"),
        globalLabel: t("tabGlobal"),
        board,
        emptyMessage: scope === "weekly" ? t("league.empty") : t("top.empty"),
        errorMessage: scope === "weekly" ? t("league.failed") : t("top.failed"),
        retryLabel: t("retry"),
    }

    const on = {
        // `push`, not `replace`: switching board is a place the reader can come back from.
        selectScope: (key: string) => router.push(`/league?scope=${key === "global" ? "global" : "weekly"}`),
        goHome: () => router.push("/dashboard"),
        climb,
        retry: () => { void query.mutate() },
        ...Object.fromEntries(board.rows.flatMap((row) => [
            [`open:${row.id}`, () => openProfile(row.name ?? "", row.isMe === true)],
            [`follow:${row.id}`, () => { void toggleFollow(row.id, row.isFollowing === true) }],
        ])),
    }

    useEffect(() => {
        if (!session.isRestoring && token === undefined) router.replace("/authentication")
    }, [router, session.isRestoring, token])

    if (session.isRestoring || token === undefined) return null

    if (query.error !== undefined && query.data === undefined) {
        return <_LeaguePage state="failed" props={props} on={on} />
    }
    if (query.data === undefined) return <_LeaguePage state="pending" props={props} on={on} />
    if (board.podium.length === 0 && board.rows.length === 0) {
        return <_LeaguePage state="empty" props={props} on={on} />
    }
    return <_LeaguePage state="ready" props={props} on={on} />
}

/** Source-level tier marker. */
export const meta = { world: "connected", domain: "community" } as const
