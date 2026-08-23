"use client"

import { ProfileChallengeSubmissionPageBase } from "./component"

/** Render the route shell; params and evidence state belong to the connected block. */
export const ProfileChallengeSubmissionPage = () => <ProfileChallengeSubmissionPageBase />

export * from "./component"
/** Source-level ownership marker for the connected route entry. */
export const meta = { world: "connected", domain: "profile" } as const
