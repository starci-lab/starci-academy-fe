"use client"

import { ProfileChallengeManagePageBase } from "./component"

/** Render the route shell; route params and evidence state belong to the connected block. */
export const ProfileChallengeManagePage = () => <ProfileChallengeManagePageBase />

export * from "./component"
/** Source-level ownership marker for the connected route entry. */
export const meta = { world: "connected", domain: "profile" } as const
