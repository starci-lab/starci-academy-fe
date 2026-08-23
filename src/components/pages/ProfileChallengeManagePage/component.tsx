import { ProfileChallengeManage } from "@/components/blocks/profile/ProfileChallengeManage"

/** Profile route shell; the connected challenge-management block owns profile-main content. */
export const ProfileChallengeManagePageBase = () => <ProfileChallengeManage />

/** Source-level ownership marker for the pure route shell. */
export const meta = { world: "pure", domain: "profile" } as const
