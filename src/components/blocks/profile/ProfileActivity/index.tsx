"use client"
import { useMemo } from "react"
import { useParams } from "next/navigation"
import { useQueryProfileEvidenceSwr } from "@/hooks/swr/useQueryProfileEvidenceSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import type {
    ProfileAchievement,
    ProfileActivity as ProfileActivityItem,
} from "@/modules/api/graphql/queries/types/profile-evidence"
import type { ActivityDayData } from "@/components/blocks/dashboard/ActivityFeed/component"
import { ProfileActivityBase } from "./component"
const actionLabel = (type: string) => type.replaceAll("_", " ").toLowerCase()
const dayLabel = (at: string) =>
    new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
        new Date(at),
    )
/** Connected activity block; owns achievement/timeline queries and retry action. */
/** Props for the connected profile activity block. */
export type ProfileActivityProps = Record<never, never>
/** Load and render the connected profile activity block. */
export const ProfileActivity = (props: ProfileActivityProps) => {
    void props
    const params = useParams<{ username?: string }>()
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
            const label = dayLabel(item.at)
            const current = groups.get(label) ?? { id: label, label, rows: [] }
            groups.set(label, {
                ...current,
                rows: [
                    ...current.rows,
                    {
                        id: item.id,
                        actor: item.actorUsername,
                        avatar: item.actorAvatar ?? undefined,
                        action: actionLabel(item.type),
                        target: item.targetLabel ?? undefined,
                        time: new Intl.DateTimeFormat(undefined, {
                            timeStyle: "short",
                        }).format(new Date(item.at)),
                        reactionCount: item.reactionCount,
                        isMine: item.isMine,
                    },
                ],
            })
        }
        return Array.from(groups.values())
    }, [activity.data])
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
                        ? "Activity couldn't be loaded."
                        : "No public activity yet.",
                    description: activity.error
                        ? "Try again to load this timeline."
                        : undefined,
                    actionLabel: activity.error ? "Try again" : undefined,
                },
                on: {
                    resultAction: () => {
                        void activity.mutate()
                    },
                },
            }}
        />
    )
}
export * from "./component"
