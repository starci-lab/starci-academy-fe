import { ProfileChallenges } from "@/components/blocks/profile/ProfileChallenges"
/** Profile challenges page shell; evidence state belongs to the connected block. */
export const ProfileChallengesPageBase = () => <ProfileChallenges />
/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "profile" } as const
