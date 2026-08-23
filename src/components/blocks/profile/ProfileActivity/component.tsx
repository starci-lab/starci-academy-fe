import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { ActivityFeedBase, type ActivityFeedProps } from "@/components/blocks/dashboard/ActivityFeed/component"
import { ProfileAchievement } from "@/components/composites/ProfileAchievement"
import { defineCompositeComponent, defineContractComponent, defineContractProjection } from "@/components/contracts/props"
import type { ProfileAchievement as ProfileAchievementData } from "@/modules/api/graphql/queries/types/profile-evidence"
/** Independent achievement and timeline states owned by the activity block. */
export type ProfileActivityBlockProps = { readonly achievementState: "pending" | "ready" | "error"; readonly achievements: ReadonlyArray<ProfileAchievementData>; readonly feed: ActivityFeedProps }
const Achievements = ({ achievementState, achievements }: ProfileActivityBlockProps) => { const items = achievementState === "pending" ? Array.from({ length: 3 }, (_, index): ProfileAchievementData => ({ slug: String(index), name: "", earned: true, currentValue: 0, threshold: 0 })) : achievements.filter((item) => item.earned); return <SurfaceCard props={{ label: "Earned achievements", isFrameless: true }} contract="profile-achievement-grid" render={defineContractComponent("profile-achievement-grid", { achievement: items.map((item) => defineCompositeComponent("profile-achievement", {}, () => <ProfileAchievement props={{ name: item.name, rarity: item.rarityPercent == null ? item.tierReached ?? "Earned" : `${item.tierReached ?? "Earned"} · ${item.rarityPercent}%` }} isLoading={achievementState === "pending"} />)) })} /> }
const Activity = ({ feed }: ProfileActivityBlockProps) => <SurfaceCard props={{ label: "Activity", isFrameless: true }} contract="activity-feed-result" render={defineContractProjection("activity-feed-result", () => <ActivityFeedBase {...feed} />)} />
/** Draw earned achievement proof before the grouped public timeline. */
export const ProfileActivityBase = (input: ProfileActivityBlockProps) => <Tree contract="profile-main" render={defineContractComponent("profile-main", { section: [defineContractProjection("label-row-over-card", () => <Achievements {...input} />), defineContractProjection("label-row-over-card", () => <Activity {...input} />)] })} />
/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "profile" } as const
