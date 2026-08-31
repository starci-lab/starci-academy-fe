import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { ActivityFeedBase, type ActivityFeedProps } from "@/components/blocks/dashboard/ActivityFeed/component"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { ProfileAchievement } from "@/components/composites/ProfileAchievement"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import type { ProfileAchievement as ProfileAchievementData } from "@/modules/api/graphql/queries/types/profile-evidence"
import { activityFeedResultClassName, profileAchievementGridClassName, profileActivityEvidenceGridClassName, profileActivityFactClassName, profileActivityFactGridClassName, profileActivityHeadingClassName, profileMainClassName } from "./classNames"
/** Format public activity dates with the active route locale instead of the browser default. */
export const profileActivityDayLabel = (at: string, locale: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(at))
/** Keep the public timeline clock locale-aware and compact. */
export const profileActivityTimeLabel = (at: string, locale: string) =>
    new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(at))
/** Independent achievement and timeline states owned by the activity block. */
export type ProfileActivityLabels = { readonly heading: string; readonly recentActivity: string; readonly achievements: string; readonly achievementTier: string; readonly achievementRarity: string; readonly achievementsEmpty: string; readonly achievementsError: string; readonly timeline: string; readonly timelineStatus: string }
/** Localized copy carried by the independently settling achievement and timeline evidence. */
export type ProfileActivityProps = { readonly achievementState: "pending" | "ready" | "error"; readonly achievements: ReadonlyArray<ProfileAchievementData>; readonly feed: ActivityFeedProps; readonly labels?: ProfileActivityLabels }
const defaultLabels: ProfileActivityLabels = { heading: "Activity", recentActivity: "Recent activity", achievements: "Achievements", achievementTier: "Tier", achievementRarity: "Rarity", achievementsEmpty: "No achievements yet.", achievementsError: "Achievements couldn't be loaded.", timeline: "Learning timeline", timelineStatus: "Timeline status" }
const Achievements = (props: ProfileActivityProps) => {
    const labels = props.labels ?? defaultLabels
    const loading = props.achievementState === "pending"
    const items = loading ? Array.from({ length: 3 }, (_, index): ProfileAchievementData => ({ slug: String(index), name: "", earned: true, currentValue: 0, threshold: 0 })) : props.achievements.filter((item) => item.earned)
    return <SurfaceCard props={{ label: labels.achievements, isFrameless: true }}><div className={profileAchievementGridClassName}>{!loading && items.length === 0 ? <EmptyNotice props={{ icon: props.achievementState === "error" ? "retry" : "complete", message: props.achievementState === "error" ? labels.achievementsError : labels.achievementsEmpty }} /> : items.map((item) => <ProfileAchievement key={item.slug} props={{ name: item.name, rarity: [item.tierReached == null ? undefined : `${labels.achievementTier} ${item.tierReached}`, item.rarityPercent == null ? undefined : `${labels.achievementRarity} ${item.rarityPercent}%`].filter(Boolean).join(" · ") || labels.achievements }} isLoading={loading} />)}</div></SurfaceCard>
}
const ActivitySummary = (props: ProfileActivityProps) => {
    const labels = props.labels ?? defaultLabels
    const earned = props.achievements.filter((item) => item.earned).length
    const events = props.feed.props.days.reduce((total, day) => total + day.rows.length, 0)
    const loading = props.achievementState === "pending" || props.feed.state === "pending"
    return <SurfaceCard props={{ inset: "compact" }} isLoading={loading}><div className={profileActivityFactGridClassName}><div className={profileActivityFactClassName}><Text props={{ content: loading ? undefined : String(events), size: "md", weight: "semibold" }} isLoading={loading} /><Text props={{ content: labels.recentActivity, size: "xs", tone: "muted" }} isLoading={loading} /></div><div className={profileActivityFactClassName}><Text props={{ content: loading ? undefined : String(earned), size: "md", weight: "semibold" }} isLoading={loading} /><Text props={{ content: labels.achievements, size: "xs", tone: "muted" }} isLoading={loading} /></div></div></SurfaceCard>
}
const Activity = (props: ProfileActivityProps) => {
    const labels = props.labels ?? defaultLabels
    return <SurfaceCard props={{ label: props.feed.state === "ready" || props.feed.state === "pending" ? labels.timeline : undefined, isFrameless: true }}><div className={activityFeedResultClassName}><ActivityFeedBase {...props.feed} props={{ ...props.feed.props, label: props.feed.state === "ready" || props.feed.state === "pending" ? props.feed.props.label : labels.timelineStatus }} /></div></SurfaceCard>
}
/** Draw earned achievement proof before the grouped public timeline. */
export const ProfileActivityBase = (props: ProfileActivityProps) => {
    const labels = props.labels ?? defaultLabels
    return <div className={profileMainClassName}><div className={profileActivityHeadingClassName}><Heading props={{ content: labels.heading, level: 2 }} /></div><ActivitySummary {...props} /><div className={profileActivityEvidenceGridClassName}><Activity {...props} /><Achievements {...props} /></div></div>
}
