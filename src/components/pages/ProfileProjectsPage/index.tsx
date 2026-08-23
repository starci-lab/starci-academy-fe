"use client"
import { ProfileProjectsPageBase } from "./component"
/** Render the projects page shell. */
export const ProfileProjectsPage = () => <ProfileProjectsPageBase />
export * from "./component"
/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "profile" } as const
