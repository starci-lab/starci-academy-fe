import { ProfileCodingProblem } from "@/components/blocks/profile/ProfileCodingProblem"

/** Profile route shell; the connected coding-proof block owns profile-main content. */
export const ProfileDetailPageBase = () => <ProfileCodingProblem />

/** Source-level ownership marker for the pure route shell. */
export const meta = { world: "pure", domain: "profile" } as const
