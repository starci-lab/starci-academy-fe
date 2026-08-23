import { ProfileChallengeSubmission } from "@/components/blocks/profile/ProfileChallengeSubmission"

/** Profile route shell; the connected submission block owns profile-main content. */
export const ProfileChallengeSubmissionPageBase = () => <ProfileChallengeSubmission />

/** Source-level ownership marker for the pure route shell. */
export const meta = { world: "pure", domain: "profile" } as const
