import { ProfileProjects } from "@/components/blocks/profile/ProfileProjects"
/** Projects page shell; the connected block owns the profile-main anatomy. */
export const ProfileProjectsPageBase = () => <ProfileProjects />
/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "profile" } as const
