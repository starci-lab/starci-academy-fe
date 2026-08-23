import { ProfileProjectRoadmap } from "@/components/blocks/profile/ProfileProjectRoadmap"

/** Profile route shell; the connected roadmap block owns profile-main content. */
export const ProfileProjectRoadmapPageBase = () => <ProfileProjectRoadmap />

/** Source-level ownership marker for the pure route shell. */
export const meta = { world: "pure", domain: "profile" } as const
