"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useMutateSetFollowSwr, useQueryResolveRouteSwr, useQuerySuggestedUsersSwr } from "@/hooks"
import { WhoToFollowBase } from "./component"

/** Load suggestions and own per-user route and follow mutations. */
/** Props for the connected who-to-follow block. */
export type WhoToFollowProps = Record<string, never>
/** Connect the WhoToFollow block to its data source. */
export const WhoToFollow = (props: WhoToFollowProps) => {
    void props
    const t = useTranslations("dashboard.explore")
    const router = useRouter()
    const query = useQuerySuggestedUsersSwr()
    const route = useQueryResolveRouteSwr()
    const follow = useMutateSetFollowSwr()
    const [followed, setFollowed] = useState<ReadonlySet<string>>(new Set())
    const [pending, setPending] = useState<string>()
    const available = query.data ?? []
    const viewProps = { label: t("whoToFollow"), users: [], emptyMessage: t("feedEmptyPlatform"), errorMessage: t("feedFailed"), retryLabel: t("retry") }
    if (query.error !== undefined) return <WhoToFollowBase state="failed" props={viewProps} on={{ retry: () => { void query.mutate() } }} />
    if (query.data === null || (query.data !== undefined && available.length === 0)) return <WhoToFollowBase state="empty" props={viewProps} />
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
    return <WhoToFollowBase state={query.data === undefined ? "pending" : "ready"} props={{ ...viewProps, users }} on={on} />
}
