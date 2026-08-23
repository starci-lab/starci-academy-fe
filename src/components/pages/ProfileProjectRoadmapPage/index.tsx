"use client"

import { ProfileProjectRoadmapPageBase } from "./component"

/** Render the route shell; params and roadmap state belong to the connected block. */
export const ProfileProjectRoadmapPage = () => <ProfileProjectRoadmapPageBase />

export * from "./component"
/** Source-level ownership marker for the connected route entry. */
export const meta = { world: "connected", domain: "profile" } as const
