import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { ActivityFeedBase, type ActivityFeedProps } from "@/components/blocks/dashboard/ActivityFeed/component"
import { ProfileAchievement } from "@/components/composites/ProfileAchievement"
import type { ProfileAchievement as ProfileAchievementData } from "@/modules/api/graphql/queries/types/profile-evidence"
/** Independent achievement and timeline states owned by the activity block. */
export type ProfileActivityProps = { readonly achievementState: "pending" | "ready" | "error"; readonly achievements: ReadonlyArray<ProfileAchievementData>; readonly feed: ActivityFeedProps }
const Achievements = (props: ProfileActivityProps) => { const items = props.achievementState === "pending" ? Array.from({ length: 3 }, (_, index): ProfileAchievementData => ({ slug: String(index), name: "", earned: true, currentValue: 0, threshold: 0 })) : props.achievements.filter((item) => item.earned); return <SurfaceCard props={{ label: "Earned achievements", isFrameless: true }}>{items.map((item) => <ProfileAchievement key={item.slug} props={{ name: item.name, rarity: item.rarityPercent == null ? item.tierReached ?? "Earned" : `${item.tierReached ?? "Earned"} · ${item.rarityPercent}%` }} isLoading={props.achievementState === "pending"} />)}</SurfaceCard> }
const Activity = (props: ProfileActivityProps) => <SurfaceCard props={{ label: "Activity", isFrameless: true }}><ActivityFeedBase {...props.feed} /></SurfaceCard>
/** Draw earned achievement proof before the grouped public timeline. */
export const ProfileActivityBase = (props: ProfileActivityProps) => <div><Achievements {...props} /><Activity {...props} /></div>
