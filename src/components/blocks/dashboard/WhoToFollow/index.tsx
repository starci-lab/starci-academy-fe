"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useMutateSetFollowSwr, useQueryResolveRouteSwr, useQuerySuggestedUsersSwr } from "@/hooks"
import { _WhoToFollow } from "./component"

/** Load suggestions and own per-user route and follow mutations. */
export const WhoToFollow = () => {
    const t = useTranslations("dashboard.explore")
    const router = useRouter()
    const query = useQuerySuggestedUsersSwr()
    const route = useQueryResolveRouteSwr()
    const follow = useMutateSetFollowSwr()
    const [followed, setFollowed] = useState<ReadonlySet<string>>(new Set())
    const [pending, setPending] = useState<string>()
    const available = query.data ?? []
    if (query.error !== undefined || query.data === null || (query.data !== undefined && available.length === 0)) {
        return <_WhoToFollow state="hidden" props={{ label: t("whoToFollow"), users: [] }} />
    }
    const users = available.slice(0, 4).map((user) => ({
        id: user.globalId,
        name: user.displayName ?? user.username,
        username: `@${user.username}`,
        avatar: user.avatar ?? undefined,
        openToWork: user.openToWork,
        openToWorkLabel: t("openToWork"),
        followLabel: t("follow"),
        followingLabel: t("followingState"),
        isFollowing: followed.has(user.globalId),
        isPending: pending === user.globalId,
    }))
    const on = Object.fromEntries(available.flatMap((user) => [
        [`open:${user.globalId}`, async () => {
            const result = await route.trigger({ globalId: user.globalId })
            const path = result.data?.resolveRoute?.data?.path
            if (path !== null && path !== undefined) router.push(path)
        }],
        [`follow:${user.globalId}`, async () => {
            setFollowed((current) => new Set([...current, user.globalId]))
            setPending(user.globalId)
            try {
                const result = await follow.trigger({ userId: user.globalId, follow: true })
                if (result.data?.setFollow?.success !== true) {
                    setFollowed((current) => {
                        const next = new Set(current)
                        next.delete(user.globalId)
                        return next
                    })
                }
            } catch (error) {
                setFollowed((current) => {
                    const next = new Set(current)
                    next.delete(user.globalId)
                    return next
                })
                throw error
            } finally { setPending(undefined) }
        }],
    ]))
    return <_WhoToFollow state={query.data === undefined ? "pending" : "ready"} props={{ label: t("whoToFollow"), users }} on={on} />
}
/** Source-level ownership marker for the connected social block. */
export const meta = { world: "connected", domain: "social" } as const
