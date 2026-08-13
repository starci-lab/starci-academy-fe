"use client"

import { useCallback, useEffect, type ReactNode } from "react"
import { useParams } from "next/navigation"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useQueryMeSwr } from "@/hooks/swr/useQueryMeSwr"
import { useQueryPublicUserCvSwr } from "@/hooks/swr/useQueryPublicUserCvSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import type { ExtendedTab } from "@/components/leaves/ExtendedTabs"
import { _PublicProfileLayout } from "./component"

/** Framework-layout boundary input. */
export type PublicProfileLayoutBoundaryProps = { readonly content: ReactNode }

const PROFILE_TABS: ReadonlyArray<Omit<ExtendedTab, "label">> = [
    { id: "overview", icon: "home" },
    { id: "projects", icon: "course" },
    { id: "challenges", icon: "review" },
    { id: "skills", icon: "practice" },
    { id: "cv", icon: "saved" },
    { id: "activity", icon: "notification" },
]

/** Connected persistent profile layout: settles canonicalization and whole-screen visibility. */
export const PublicProfileLayout = ({ content }: PublicProfileLayoutBoundaryProps) => {
    const t = useTranslations("profile")
    const tabsT = useTranslations("profile.tabs")
    const params = useParams<{ username?: string }>()
    const pathname = usePathname()
    const router = useRouter()
    const username = params?.username ? String(params.username) : undefined
    const profile = useQueryUserProfileSwr(username)
    const publicCv = useQueryPublicUserCvSwr(username)
    const viewer = useQueryMeSwr()
    const isSelf = profile.data !== null && profile.data !== undefined && viewer.data?.id === profile.data.id
    const visibleTabs = PROFILE_TABS
        .filter((tab) => tab.id !== "cv" || isSelf || Boolean(publicCv.data))
        .map((tab) => ({ ...tab, label: tabsT(tab.id) }))
    const selectedTab = PROFILE_TABS.find((tab) => tab.id !== "overview" && pathname.startsWith(`/profile/${username}/${tab.id}`))?.id ?? "overview"
    const state = profile.error !== undefined && profile.data === undefined
        ? "failed"
        : profile.data === undefined
            ? "loading"
            : profile.data === null
                ? "not-found"
                : profile.data.profileLocked && !isSelf
                    ? "locked"
                    : "ready"

    useEffect(() => {
        if (profile.data?.username && username && profile.data.username !== username) {
            router.replace(`/profile/${profile.data.username}`)
        }
    }, [profile.data?.username, router, username])

    const Body = useCallback(() => <>{content}</>, [content])
    return (
        <_PublicProfileLayout
            state={state}
            props={{
                notFoundMessage: t("notFound"),
                failedMessage: t("failed"),
                lockedMessage: t("locked"),
                lockedDescription: t("lockedDescription"),
                homeLabel: t("actions.home"),
                retryLabel: t("actions.retry"),
                browseLabel: t("actions.browse"),
                tabs: { label: tabsT("label"), selectedKey: selectedTab, tabs: visibleTabs },
            }}
            on={{
                home: () => router.push("/"),
                browse: () => router.push("/courses"),
                retry: () => void profile.mutate(),
                selectTab: (key) => router.push(key === "overview" ? `/profile/${username}` : `/profile/${username}/${key}`),
            }}
            body={Body}
        />
    )
}

export * from "./component"

/** Source-level marker for the connected profile layout. */
export const meta = { world: "connected", domain: "profile" } as const
