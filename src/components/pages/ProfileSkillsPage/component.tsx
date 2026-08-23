import { ProfileSkills } from "@/components/blocks/profile/ProfileSkills"
/** Skills page shell; the connected block owns profile-main and evidence state. */
export const ProfileSkillsPageBase = () => <ProfileSkills />
/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "profile" } as const
