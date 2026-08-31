"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useQueryMeSwr } from "@/hooks/swr/useQueryMeSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import { useMutateSetFollowSwr } from "@/hooks/swr/useMutateSetFollowSwr"
import { useOverviewEvidence } from "../overview/useOverviewEvidence"
import { ProfileHeroBase } from "./component"

type ProfileTranslator = (key: string) => string;
type EvidenceCourse = { readonly label: string }
type ChallengeEvidence = { readonly id: string }
type PracticeEvidence = { readonly byDifficulty: ReadonlyArray<{ readonly solved: number }> }

const primaryLabelOf = (
    isSelf: boolean,
    canHire: boolean,
    followed: boolean | undefined,
    t: ProfileTranslator,
) => {
    if (isSelf) return t("cv.edit")
    if (canHire) return t("actions.hire")
    return followed ? t("actions.following") : t("actions.follow")
}

/** Connected identity rail: resolves viewer context, CTA precedence and share/follow behavior. */
/** Props for the connected profile hero block. */
export type ProfileHeroProps = Record<never, never>
/** Load and render the connected profile hero block. */
export const ProfileHero = (props: ProfileHeroProps) => {
    void props
    const t = useTranslations("profile")
    const locale = useLocale()
    const params = useParams<{ username?: string }>()
    const router = useRouter()
    const username = params?.username ? String(params.username) : undefined
    const profile = useQueryUserProfileSwr(username)
    const viewer = useQueryMeSwr()
    const follow = useMutateSetFollowSwr()
    const [sharePending, setSharePending] = useState(false)
    const courses = useOverviewEvidence<ReadonlyArray<EvidenceCourse>>("courses")
    const challenges = useOverviewEvidence<ReadonlyArray<ChallengeEvidence>>("solved-challenges")
    const practice = useOverviewEvidence<PracticeEvidence>("coding-skills")
    const user = profile.data
    const isSelf = user?.id !== undefined && viewer.data?.id === user.id
    const canHire =
    !isSelf && user?.openToWork === true && Boolean(user.githubUsername)
    const primaryLabel = primaryLabelOf(isSelf, canHire, user?.isFollowedByMe, t)
    const joinedLabel = useMemo(() => {
        if (!user?.createdAt) return ""
        const date = new Date(user.createdAt)
        return Number.isNaN(date.getTime())
            ? ""
            : t("joined", {
                date: new Intl.DateTimeFormat(locale, {
                    month: "long",
                    year: "numeric",
                }).format(date),
            })
    }, [locale, t, user?.createdAt])

    const practiceTotal = practice.data?.byDifficulty.reduce(
        (sum, item) => sum + item.solved,
        0,
    ) ?? 0
    const evidenceLoading = courses.isLoading || challenges.isLoading || practice.isLoading
    const evidenceItems = [
        t("overview.challengeEvidence", { count: challenges.data?.length ?? 0 }),
        t("overview.practiceEvidence", { count: practiceTotal }),
        courses.data?.[0]?.label
            ? t("overview.courseEvidence", { course: courses.data[0].label })
            : t("overview.courseEvidenceEmpty"),
    ]

    const onPrimary = () => {
        if (!user) return
        if (isSelf) {
            router.push(`/profile/${user.username}/cv`)
            return
        }
        if (canHire && user.githubUsername) {
            window.open(
                `https://github.com/${user.githubUsername}`,
                "_blank",
                "noopener,noreferrer",
            )
            return
        }
        void follow
            .trigger({ userId: user.id, follow: !user.isFollowedByMe })
            .then(() => profile.mutate())
    }
    const onShare = async () => {
        if (sharePending) return
        const url = window.location.href
        setSharePending(true)
        try {
            if (navigator.share) {
                await navigator.share({
                    title: user?.displayName ?? user?.username ?? "",
                    url,
                })
            } else {
                await navigator.clipboard.writeText(url)
            }
        } catch {
            return
        } finally {
            setSharePending(false)
        }
    }

    return (
        <ProfileHeroBase
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
                sharePending,
                githubUrl: user?.githubUsername
                    ? `https://github.com/${user.githubUsername}`
                    : undefined,
                linkedinUrl: user?.linkedinUrl ?? undefined,
                websiteUrl: user?.websiteUrl ?? undefined,
                joinedLabel,
                evidenceLabel: t("overview.evidenceSummary"),
                evidenceItems,
                evidenceLoading,
            }}
            on={{ primary: onPrimary, share: onShare }}
        />
    )
}

export * from "./component"

/** Source-level marker for the connected profile block. */
