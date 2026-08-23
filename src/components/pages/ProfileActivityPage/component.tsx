import { ProfileActivity } from "@/components/blocks/profile/ProfileActivity"
/** Activity page shell; the connected block owns profile-main and evidence state. */
export const ProfileActivityPageBase = () => <ProfileActivity />
/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "profile" } as const
