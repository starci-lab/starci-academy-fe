"use client"
import { useMemo } from "react"
import { useParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryProfileEvidenceSwr } from "@/hooks/swr/useQueryProfileEvidenceSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import type {
    ProfileAchievement,
    ProfileActivity as ProfileActivityItem,
} from "@/modules/api/graphql/queries/types/profile-evidence"
import type { ActivityDayData } from "@/components/blocks/dashboard/ActivityFeed/component"
import { ProfileActivityBase, profileActivityDayLabel, profileActivityTimeLabel } from "./component"
type ActivityTranslator = (key: string) => string
const actionLabel = (type: string, t: ActivityTranslator) => {
    const normalized = type
        .replaceAll("_", " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^(lesson)(read)$/i, "$1 $2")
        .toLowerCase()
    const key = ({ "lesson read": "contentRead", "coding solved": "codingSolved", "challenge passed": "challengePassed" } as Readonly<Record<string, string>>)[normalized]
    return key === undefined ? normalized : t(key)
}
/** Connected activity block; owns achievement/timeline queries and retry action. */
/** Props for the connected profile activity block. */
export type ProfileActivityProps = Record<never, never>
/** Load and render the connected profile activity block. */
export const ProfileActivity = (props: ProfileActivityProps) => {
    void props
    const params = useParams<{ username?: string }>()
    const router = useRouter()
    const locale = useLocale()
    const t = useTranslations("profile")
    const exploreT = useTranslations("dashboard.explore")
    const activityT = useTranslations("dashboard.explore.activity")
    const username = String(params.username ?? "")
    const profile = useQueryUserProfileSwr(username)
    const achievements = useQueryProfileEvidenceSwr<
    ReadonlyArray<ProfileAchievement>
  >("achievements", profile.data?.id)
    const activity = useQueryProfileEvidenceSwr<{
    readonly items: ReadonlyArray<ProfileActivityItem>;
    readonly nextCursor?: string | null;
  }>("activity", profile.data?.id, { limit: 20 })
    const days = useMemo(() => {
        const groups = new Map<string, ActivityDayData>()
        for (const item of activity.data?.items ?? []) {
            const label = profileActivityDayLabel(item.at, locale)
            const current = groups.get(label) ?? { id: label, label, rows: [] }
            groups.set(label, {
                ...current,
                rows: [
                    ...current.rows,
                    {
                        id: item.id,
                        actor: item.actorUsername,
                        avatar: item.actorAvatar ?? undefined,
                        action: actionLabel(item.type, activityT),
                        target: item.targetLabel ?? undefined,
                        time: profileActivityTimeLabel(item.at, locale),
                        reactionCount: item.reactionCount,
                        isMine: item.isMine,
                    },
                ],
            })
        }
        return Array.from(groups.values())
    }, [activity.data, activityT, locale])
    return (
        <ProfileActivityBase
            achievementState={
                achievements.error
                    ? "error"
                    : achievements.isLoading || profile.isLoading
                        ? "pending"
                        : "ready"
            }
            achievements={achievements.data ?? []}
            labels={{ heading: t("tabs.activity"), recentActivity: t("evidence.activity.label"), achievements: t("evidence.achievements.label"), achievementTier: t("evidence.achievements.tier"), achievementRarity: t("evidence.achievements.rarity"), achievementsEmpty: t("evidence.achievements.empty"), achievementsError: t("evidence.error"), timeline: t("evidence.activity.label"), timelineStatus: t("evidence.activity.label") }}
            feed={{
                state: activity.error
                    ? "failed"
                    : activity.isLoading || profile.isLoading
                        ? "pending"
                        : days.length === 0
                            ? "platformEmpty"
                            : "ready",
                props: {
                    days,
                    message: activity.error
                        ? t("evidence.error")
                        : t("evidence.activity.empty"),
                    description: activity.error
                        ? exploreT("feedFailed")
                        : undefined,
                    actionLabel: activity.error ? exploreT("retry") : exploreT("browseCourses"),
                },
                on: {
                    resultAction: () => {
                        if (activity.error) void activity.mutate()
                        else router.push("/courses")
                    },
                },
            }}
        />
    )
}
export * from "./component"
