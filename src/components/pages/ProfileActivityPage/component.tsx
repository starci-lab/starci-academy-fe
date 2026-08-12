import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { _ActivityFeed, type ActivityFeedProps } from "@/components/blocks/dashboard/ActivityFeed/component"
import { ProfileAchievement } from "@/components/composites/ProfileAchievement"
import { defineCompositeComponent, defineContractComponent, defineContractProjection } from "@/components/contracts/props"
import type { ProfileAchievement as ProfileAchievementData } from "@/modules/api/graphql/queries/types/profile-evidence"

/** Independently settled achievement and timeline states. */
export type ProfileActivityPageProps = {
    readonly achievementState: "pending" | "ready" | "error"
    readonly achievements: ReadonlyArray<ProfileAchievementData>
    readonly feed: ActivityFeedProps
}

const Achievements = ({ achievementState, achievements }: ProfileActivityPageProps) => {
    const items = achievementState === "pending" ? Array.from({ length: 3 }, (_, index): ProfileAchievementData => ({ slug: String(index), name: "", earned: true, currentValue: 0, threshold: 0 })) : achievements.filter((item) => item.earned)
    return <SurfaceCard props={{ label: "Earned achievements", isFrameless: true }} contract="profile-achievement-grid" render={defineContractComponent("profile-achievement-grid", {
        achievement: items.map((item) => defineCompositeComponent("profile-achievement", {}, () => <ProfileAchievement props={{ name: item.name, rarity: item.rarityPercent == null ? item.tierReached ?? "Earned" : `${item.tierReached ?? "Earned"} · ${item.rarityPercent}%` }} isLoading={achievementState === "pending"} />)),
    })} />
}

const Activity = ({ feed }: ProfileActivityPageProps) => <SurfaceCard props={{ label: "Activity", isFrameless: true }} contract="activity-feed-result" render={defineContractProjection("activity-feed-result", () => <_ActivityFeed {...feed} />)} />

/** Preserve legacy order: earned achievement proof before day-grouped chronological activity. */
export const _ProfileActivityPage = (input: ProfileActivityPageProps) => <Tree contract="profile-main" render={defineContractComponent("profile-main", {
    section: [
        defineContractProjection("label-row-over-card", () => <Achievements {...input} />),
        defineContractProjection("label-row-over-card", () => <Activity {...input} />),
    ],
})} />

/** Source-level tier marker. */
export const meta = { world: "pure", domain: "profile" } as const
