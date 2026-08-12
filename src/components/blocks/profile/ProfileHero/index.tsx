"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useQueryMeSwr } from "@/hooks/swr/useQueryMeSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import { useMutateSetFollowSwr } from "@/hooks/swr/useMutateSetFollowSwr"
import { _ProfileHero } from "./component"

/** Connected identity rail: resolves viewer context, CTA precedence and share/follow behavior. */
export const ProfileHero = () => {
    const t = useTranslations("profile")
    const params = useParams<{ username?: string }>()
    const router = useRouter()
    const username = params?.username ? String(params.username) : undefined
    const profile = useQueryUserProfileSwr(username)
    const viewer = useQueryMeSwr()
    const follow = useMutateSetFollowSwr()
    const user = profile.data
    const isSelf = user !== null && user !== undefined && viewer.data?.id === user.id
    const canHire = !isSelf && user?.openToWork === true && Boolean(user.githubUsername)
    const primaryLabel = isSelf
        ? t("actions.edit")
        : canHire
            ? t("actions.hire")
            : user?.isFollowedByMe ? t("actions.following") : t("actions.follow")
    const joinedLabel = useMemo(() => {
        if (!user?.createdAt) return ""
        const date = new Date(user.createdAt)
        return Number.isNaN(date.getTime()) ? "" : t("joined", { date: new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(date) })
    }, [t, user?.createdAt])

    const onPrimary = () => {
        if (!user) return
        if (isSelf) {
            router.push("/profile/settings/edit")
            return
        }
        if (canHire && user.githubUsername) {
            window.open(`https://github.com/${user.githubUsername}`, "_blank", "noopener,noreferrer")
            return
        }
        void follow.trigger({ userId: user.id, follow: !user.isFollowedByMe }).then(() => profile.mutate())
    }
    const onShare = () => {
        const url = window.location.href
        if (navigator.share) {
            void navigator.share({ title: user?.displayName ?? user?.username ?? "", url })
        } else {
            void navigator.clipboard.writeText(url)
        }
    }

    return (
        <_ProfileHero
            state={profile.data === undefined ? "pending" : "ready"}
            props={{
                name: user?.displayName?.trim() || user?.username || "",
                handle: user?.username || username || "",
                avatar: user?.avatar ?? undefined,
                role: user?.roleTitle ?? undefined,
                bio: user?.bio ?? undefined,
                location: user?.location ?? undefined,
                workMode: user?.workMode ?? undefined,
                followerLabel: t("followers", { count: user?.followerCount ?? 0 }),
                followingLabel: t("following", { count: user?.followingCount ?? 0 }),
                primaryLabel,
                primaryPending: follow.isMutating,
                shareLabel: t("actions.share"),
                githubUrl: user?.githubUsername ? `https://github.com/${user.githubUsername}` : undefined,
                linkedinUrl: user?.linkedinUrl ?? undefined,
                websiteUrl: user?.websiteUrl ?? undefined,
                joinedLabel,
            }}
            on={{ primary: onPrimary, share: onShare }}
        />
    )
}

export * from "./component"

/** Source-level marker for the connected profile block. */
export const meta = { world: "connected", domain: "profile" } as const
