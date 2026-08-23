"use client"
import { ProfileSkillsPageBase } from "./component"
/** Render the skills page shell. */
export const ProfileSkillsPage = () => <ProfileSkillsPageBase />
export * from "./component"
/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "profile" } as const
